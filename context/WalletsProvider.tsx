import { ReactNode, useContext, useState, createContext, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY, PUBLIC_PATHS, VAULT_KEY, VAULT_SERVICE_WORKER_ID } from '../util/Constants'
import { Wallet, Account } from '../util/Vault'
import { getSetting, setSetting } from '../util/Settings'
import { debounce, debug } from '../util/Utils'
import { Messenger } from '../util/Messenger'
import { AddAccountArguments, AddAccountResult, AddWalletArguments, AddWalletResult, GetAccountsResult, ImportAccountArguments, ImportAccountResult, IncomingMessage, IsLockedResult, OutgoingMessage, SerializeResult, UnlockArguments, UnlockResult } from '../workers/Vault-Worker-Interfaces'


type WalletContextType = {
  wallets: Record<string, Wallet>
  unlock: (password: string) => Promise<void>
  lock: () => Promise<void>
  addWallet: (walletName: string, secretRecoveryPhrase?: string) => Promise<Wallet>
  addAccount: (walletName: string, accountName: string) => Promise<Account>
  importAccount: (walletName: string, accountName: string, accountAddress: string, accountPrivateKey?: string) => Promise<Account>
  isLocked: boolean
  isLoading: boolean
  saveVault: () => Promise<void>
  isVaultSetup: () => boolean
}

export const WalletsContext = createContext<WalletContextType>({
  wallets: {},
  unlock: (password: string) => new Promise((resolve) => resolve()),
  lock: () => new Promise((resolve) => resolve()),
  addWallet: (walletName: string, secretRecoveryPhrase?: string) => new Promise((resolve) => resolve({ name: '', accounts: {} })),
  addAccount: (walletName: string, accountName: string) => new Promise((resolve) => resolve({ public: { name: '', address: '' }, signers: {} })),
  importAccount: (walletName: string, accountName: string, accountAddress: string, accountPrivateKey?: string) => new Promise((resolve) => resolve({ public: { name: '', address: '' }, signers: {} })),
  isLocked: true,
  isLoading: true,
  saveVault: () => new Promise((resolve) => resolve()),
  isVaultSetup: () => false,
})

export const useWallets = () => useContext(WalletsContext)

export const WalletsProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const router = useRouter()

  const [wallets, setWallets] = useState<Record<string, Wallet>>({})
  const [isLocked, setIsLocked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const vaultServiceWorker = useRef<ServiceWorkerRegistration>()
  const vaultMessenger = useRef<Messenger<OutgoingMessage, IncomingMessage>>()

  useEffect(() => {
    if (isVaultSetup() && !isLocked && !isLoading) {
      saveVault()
    }
  }, [isLocked, isLoading, wallets])

  useEffect(() => {
    if (!isLoading && isLocked) {
      const path = router.asPath.split('?')[0]
      if (!PUBLIC_PATHS.includes(path)) {
        router.push({
          pathname: '/unlock',
          query: { returnUrl: path }
        })
      }
    }
  }, [isLoading, isLocked, router])

  const unlock = async (password: string) => {
    const encryptedVault = localStorage.getItem(VAULT_KEY)

    const { result } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'unlock',
      arguments: {
        password,
        encryptedVault
      } as UnlockArguments
    })

    setIsLocked(false)
    setWallets(result as UnlockResult)
  }

  const lock = useCallback(async () => {
    await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'lock'
    })
    setIsLocked(true)
    setWallets({})
  }, [])

  const checkAutoLock = useCallback(async () => {
    const autolockDeadlineStr = getSetting<number>(AUTOLOCK_DEADLINE_KEY)

    let shouldLock = true

    if (autolockDeadlineStr) {
      const now = new Date()
      const autolockDeadline = new Date(autolockDeadlineStr)

      if (now < autolockDeadline) {
        shouldLock = false
      }
    }

    if (!isLocked && shouldLock) {
      debug('auto-locking application')
      await lock()
    }

  }, [isLocked, lock])

  useEffect(() => {
    // check autolock timeout every minute
    let checkAutoLockTimeout: number
    checkAutoLockTimeout = window.setTimeout(async function cb() {
      await checkAutoLock()

      checkAutoLockTimeout = window.setTimeout(cb, 60000)
    }, 60000)

    const interactionEvents = ['click', 'keydown', 'scroll']

    // interactions handling
    const eventHandler = (ev: any) => {
      const unlockTime = getSetting<number>(DEFAULT_AUTOLOCK_TIME_KEY) || 1
      const unlockTimeDeadline = new Date().getTime() + (unlockTime * 60 * 1000)
      setSetting(AUTOLOCK_DEADLINE_KEY, unlockTimeDeadline)
    }

    const debouncedEventHandler = debounce((ev: any) => eventHandler(ev))

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, debouncedEventHandler)
    })

    return () => {
      window.clearTimeout(checkAutoLockTimeout)

      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, debouncedEventHandler)
      })
    }
  }, [checkAutoLock])


  useEffect(() => {

    let registration: ServiceWorkerRegistration
    let msgr: Messenger<OutgoingMessage, IncomingMessage>

    let timeout = window.setTimeout(async function cb() {
      try {
        debug('Vault worker ping')
        await msgr?.ping(VAULT_SERVICE_WORKER_ID)
        debug('Vault worker alive')
      } catch (error) {
        debug('Vault worker offline, reloading...')
        window.location.reload()
      }
      timeout = window.setTimeout(cb, 20000)
    }, 20000)

    const setup = async () => {
      setIsLoading(true)
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register(new URL('../workers/Vault-Worker.ts', import.meta.url))

          registration.addEventListener('updatefound', async () => {
            debug('A new Vault worker version was found')
            registration.installing?.addEventListener('statechange', () => {
              if (registration.waiting) {
                // our new instance is now waiting for activation (its state is 'installed')
                // we now may invoke our update UX safely
                debug('Vault worker updated, refreshing...')
                window.location.reload()
              }
            })
          })

          vaultServiceWorker.current = registration

          msgr = new Messenger<OutgoingMessage, IncomingMessage>(registration.active!, 'vault-connector-child', false)
          vaultMessenger.current = msgr

          if (registration.installing) {
            debug('Vault worker installing')
          } else if (registration.waiting) {
            debug('Vault worker installed')
            msgr.sendMessage(VAULT_SERVICE_WORKER_ID, {
              command: 'skipWaiting'
            })
          } else if (registration.active) {
            debug('Vault worker active')
          }

          const { result: isLockedResult } = await msgr.sendRequest(VAULT_SERVICE_WORKER_ID, {
            command: 'isLocked'
          })

          // get accounts if already unlocked
          if (!(isLockedResult as IsLockedResult)) {
            const { result: getAccountsResult } = await msgr.sendRequest(VAULT_SERVICE_WORKER_ID, {
              command: 'getAccounts'
            })

            setWallets(getAccountsResult as GetAccountsResult)

            setIsLocked(false)
          }

          setIsLoading(false)

        } catch (error) {
          console.error(`Vault worker registration failed with ${error}`)
        }
      }
    }

    setup()

    return () => {
      clearTimeout(timeout)
      msgr?.removeListener()
    }
  }, [])

  const isVaultSetup = () => {
    return localStorage.getItem(VAULT_KEY) !== null
  }

  const addWallet = async (walletName: string, secretRecoveryPhrase?: string) => {
    // add wallet to vault
    const { result: addWalletResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'addWallet',
      arguments: {
        walletName,
        secretRecoveryPhrase
      } as AddWalletArguments
    })

    const newWallet = addWalletResult as AddWalletResult

    console.log('newWallet', newWallet)

    // update state
    setWallets({ ...wallets, [walletName]: newWallet })
   
    return newWallet
  }

  const addAccount = async (walletName: string, accountName: string) => {
    // add account to wallet
    const { result: addAccountResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'addAccount',
      arguments: {
        walletName,
        accountName
      } as AddAccountArguments
    })

    const newAccount = addAccountResult as AddAccountResult

    console.log('newAccount', newAccount)

    wallets[walletName].accounts[accountName] = newAccount

    // update state
    setWallets({...wallets})

    return newAccount
  }

  const importAccount = async (walletName: string, accountName: string, accountAddress: string, accountPrivateKey?: string) => {
    // add account to wallet
    const { result: importAccountResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'importAccount',
      arguments: {
        walletName,
        accountName,
        accountAddress,
        accountPrivateKey
      } as ImportAccountArguments
    })

    const newAccount = importAccountResult as ImportAccountResult

    wallets[walletName].accounts[accountName] = newAccount

    // update state
    setWallets({...wallets})

    return newAccount
  }

  const saveVault = async () => {
    // save vault to localstorage
    const { result: serializedVault } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'serialize'
    })

    localStorage.setItem(VAULT_KEY, serializedVault as SerializeResult)
  }

  return (
    <WalletsContext.Provider value={{
      wallets,
      unlock,
      lock,
      addWallet,
      addAccount,
      importAccount,
      isLoading,
      isLocked,
      saveVault,
      isVaultSetup
    }}>
      {children}
    </WalletsContext.Provider>
  )
}