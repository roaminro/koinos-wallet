import { ReactNode, useContext, useState, createContext, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY, PUBLIC_PATHS, SELECTED_ACCOUNT_KEY, VAULT_KEY, VAULT_SERVICE_WORKER_ID } from '../util/Constants'
import { Wallet, Account } from '../util/Vault'
import { getSetting, setSetting } from '../util/Settings'
import { debounce, debug } from '../util/Utils'
import { Messenger } from '../util/Messenger'
import { AddAccountArguments, AddAccountResult, AddWalletArguments, AddWalletResult, GetAccountPrivateKeyArguments, GetAccountsResult, GetWalletSecretRecoveryPhraseArguments, ImportAccountArguments, ImportAccountResult, IncomingMessage, IsLockedResult, OutgoingMessage, SerializeResult, SignHashArguments, SignTransactionArguments, TryDecryptArguments, UnlockArguments, UnlockResult } from '../workers/Vault-Worker-Interfaces'
import { TransactionJson } from 'koilib/lib/interface'


type WalletContextType = {
  wallets: Record<string, Wallet>
  isLocked: boolean
  isLoading: boolean
  isVaultSetup: boolean
  selectedAccount?: SelectedAccount
  unlock: (password: string) => Promise<void>
  lock: () => Promise<void>
  addWallet: (walletName: string, secretRecoveryPhrase?: string) => Promise<Wallet>
  tryDecrypt: (password: string, encryptedVault: string) => Promise<void>
  addAccount: (walletId: string, accountName: string) => Promise<Account>
  importAccount: (walletId: string, accountName: string, accountAddress: string, accountPrivateKey?: string) => Promise<Account>
  selectAccount: (walletId: string, walletName: string, account: Account) => void
  signTransaction: (signerAddress: string, transaction: TransactionJson) => Promise<TransactionJson>
  signHash: (signerAddress: string, hash: Uint8Array) => Promise<Uint8Array>
  saveVaultToLocalStorage: () => Promise<void>
  getWalletSecretRecoveryPhrase: (walletId: string, password: string) => Promise<string>
  getAccountPrivateKey: (walletId: string, accountId: string, password: string) => Promise<string>
}

type SelectedAccount = {
  walletId: string
  walletName: string
  account: Account
}

export const WalletsContext = createContext<WalletContextType>({
  wallets: {},
  isLocked: true,
  isLoading: true,
  isVaultSetup: false,
  unlock: (password: string) => new Promise((resolve) => resolve()),
  lock: () => new Promise((resolve) => resolve()),
  addWallet: (walletName: string, secretRecoveryPhrase?: string) => new Promise((resolve) => resolve({ id: '', name: '', accounts: {} })),
  tryDecrypt: (password: string, encryptedVault: string) => new Promise((resolve) => resolve()),
  addAccount: (walletId: string, accountName: string) => new Promise((resolve) => resolve({ public: { id: '', name: '', address: '' }, signers: {} })),
  importAccount: (walletId: string, accountName: string, accountAddress: string, accountPrivateKey?: string) => new Promise((resolve) => resolve({ public: { id: '', name: '', address: '' }, signers: {} })),
  selectAccount: (walletId: string, walletName: string, account: Account) => { },
  signTransaction: (signerAddress: string, transaction: TransactionJson) => new Promise((resolve) => resolve({})),
  signHash: (signerAddress: string, hash: Uint8Array) => new Promise((resolve) => resolve(new Uint8Array)),
  saveVaultToLocalStorage: () => new Promise((resolve) => resolve()),
  getWalletSecretRecoveryPhrase: (walletId: string, password: string) => new Promise((resolve) => resolve('')),
  getAccountPrivateKey: (walletId: string, accountId: string, password: string) => new Promise((resolve) => resolve('')),
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
  const [isVaultSetup, setIsVaultSetup] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount>()
  const vaultServiceWorker = useRef<ServiceWorkerRegistration>()
  const vaultMessenger = useRef<Messenger<OutgoingMessage, IncomingMessage>>()

  const saveVaultToLocalStorage = async () => {
    const { result: serializedVault } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'serialize'
    })

    localStorage.setItem(VAULT_KEY, serializedVault as SerializeResult)
  }

  const saveSelectedAccountToLocalStorage = (selectedAccount: SelectedAccount) => {
    localStorage.setItem(SELECTED_ACCOUNT_KEY, JSON.stringify(selectedAccount))
  }

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
    setIsVaultSetup(true)
    setWallets(result as UnlockResult)
  }

  const lock = useCallback(async () => {
    await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'lock'
    })
    setIsLocked(true)
    setWallets({})
  }, [])

  const tryDecrypt = async (password: string, encryptedVault: string) => {
    await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'tryDecrypt',
      arguments: {
        password,
        encryptedVault
      } as TryDecryptArguments
    })
  }

  const isVaultLocked = async () => {
    const { result } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'isLocked'
    })

    return result as IsLockedResult
  }

  const getVaultAccounts = async () => {
    const { result } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'getAccounts'
    })

    return result as GetAccountsResult
  }

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
    setIsVaultSetup(localStorage.getItem(VAULT_KEY) !== null)

    const savedSelectedAccount = localStorage.getItem(SELECTED_ACCOUNT_KEY)
    if (savedSelectedAccount) {
      setSelectedAccount(JSON.parse(savedSelectedAccount))
    }

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

          // get accounts if already unlocked
          if (!await isVaultLocked()) {
            setWallets(await getVaultAccounts())

            setIsLocked(false)
          }

          setIsLoading(false)

        } catch (error) {
          console.error('Vault worker registration failed with error', error)
        }
      }
    }

    setup()

    const onStorageUpdate = async (e: StorageEvent) => {
      const { key, newValue } = e

      if (newValue) {
        if (key === VAULT_KEY && !await isVaultLocked()) {
          setIsVaultSetup(true)
          setWallets(await getVaultAccounts())
          setIsLocked(false)
        } else if (key === SELECTED_ACCOUNT_KEY) {
          setSelectedAccount(JSON.parse(newValue))
        }
      }
    }

    window.addEventListener('storage', onStorageUpdate)

    return () => {
      clearTimeout(timeout)
      msgr?.removeListener()
      window.removeEventListener('storage', onStorageUpdate)
    }
  }, [])

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
    const newWallets = { ...wallets, [newWallet.id]: newWallet }

    // update state
    setWallets(newWallets)
    saveVaultToLocalStorage()

    return newWallet
  }

  const addAccount = async (walletId: string, accountName: string) => {
    // add account to wallet
    const { result: addAccountResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'addAccount',
      arguments: {
        walletId,
        accountName
      } as AddAccountArguments
    })

    const newAccount = addAccountResult as AddAccountResult

    const newWallets = { ...wallets }
    newWallets[walletId].accounts[newAccount.public.id] = newAccount

    // update state
    setWallets(newWallets)
    saveVaultToLocalStorage()

    return newAccount
  }

  const importAccount = async (walletId: string, accountName: string, accountAddress: string, accountPrivateKey?: string) => {
    // add account to wallet
    const { result: importAccountResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'importAccount',
      arguments: {
        walletId,
        accountName,
        accountAddress,
        accountPrivateKey
      } as ImportAccountArguments
    })

    const newAccount = importAccountResult as ImportAccountResult

    const newWallets = { ...wallets }

    newWallets[walletId].accounts[newAccount.public.id] = newAccount

    // update state
    setWallets(newWallets)
    saveVaultToLocalStorage()

    return newAccount
  }

  const signTransaction = async (signerAddress: string, transaction: TransactionJson) => {
    const { result: signedTransaction } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'signTransaction',
      arguments: {
        signerAddress,
        transaction
      } as SignTransactionArguments
    })

    return signedTransaction as TransactionJson
  }

  const signHash = async (signerAddress: string, hash: Uint8Array) => {
    const { result: signedHash } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'signHash',
      arguments: {
        signerAddress,
        hash
      } as SignHashArguments
    })

    return signedHash as Uint8Array
  }

  const getWalletSecretRecoveryPhrase = async (walletId: string, password: string) => {
    const { result: secretRecoveryPhrase } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'getWalletSecretRecoveryPhrase',
      arguments: {
        walletId,
        password
      } as GetWalletSecretRecoveryPhraseArguments
    })

    return secretRecoveryPhrase as string
  }

  const getAccountPrivateKey = async (walletId: string, accountId: string, password: string) => {
    const { result: privateKey } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'getAccountPrivateKey',
      arguments: {
        walletId,
        accountId,
        password
      } as GetAccountPrivateKeyArguments
    })

    return privateKey as string
  }

  const selectAccount = (walletId: string, walletName: string, account: Account) => {
    const newSelectedAccount = {
      walletId,
      walletName,
      account
    }

    setSelectedAccount(newSelectedAccount)
    saveSelectedAccountToLocalStorage(newSelectedAccount)
  }

  return (
    <WalletsContext.Provider value={{
      wallets,
      isLoading,
      isLocked,
      isVaultSetup,
      selectedAccount,
      unlock,
      lock,
      addWallet,
      addAccount,
      importAccount,
      saveVaultToLocalStorage,
      tryDecrypt,
      selectAccount,
      signTransaction,
      signHash,
      getWalletSecretRecoveryPhrase,
      getAccountPrivateKey
    }}>
      {children}
    </WalletsContext.Provider>
  )
}