import { ReactNode, useContext, useState, createContext, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY, PUBLIC_PATHS, VAULT_KEY, VAULT_SERVICE_WORKER_ID } from '../util/Constants'
import { Vault, Wallet } from '../util/Vault'
import { getSetting, setSetting } from '../util/Settings'
import { debounce } from '../util/Utils'
import { Messenger } from '../util/Messenger'
import { IncomingMessage, OutgoingMessage } from '../workers/Vault-Worker'


type WalletContextType = {
  wallets: Wallet[]
  unlock: (password: string) => Promise<void>
  lock: () => Promise<void>
  addWallet: (password: string, walletName: string, accountName: string, secretPhrase: string) => Promise<void>
  isLocked: boolean
  isVaultSetup: () => boolean
}

export const WalletsContext = createContext<WalletContextType>({
  wallets: [],
  unlock: (password: string) => new Promise((resolve) => resolve()),
  lock: () => new Promise((resolve) => resolve()),
  addWallet: (password: string, walletName: string, accountName: string, secretPhrase: string) => new Promise((resolve) => resolve()),
  isLocked: true,
  isVaultSetup: () => false,
})

export const useWallets = () => useContext(WalletsContext)

export const WalletsProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const router = useRouter()

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLocked, setIsLocked] = useState(true)
  // const vault = useRef<Vault>(new Vault())
  const vaultServiceWorker = useRef<ServiceWorkerRegistration>()
  const vaultMessenger = useRef<Messenger<OutgoingMessage, IncomingMessage>>()

  useEffect(() => {
    if (isLocked) {
      const path = router.asPath.split('?')[0]
      if (!PUBLIC_PATHS.includes(path)) {
        router.push({
          pathname: '/unlock',
          query: { returnUrl: path }
        })
      }
    }
  }, [isLocked, router])

  const unlock = async (password: string) => {
    const encryptedVault = localStorage.getItem(VAULT_KEY)

    if (encryptedVault) {
      const { result } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
        command: 'unlock',
        arguments: JSON.stringify({
          password,
          encryptedVault
        })
      })

      const wallets = JSON.parse(result!)
      console.log(wallets)
      setIsLocked(false)
      setWallets([...wallets])
    }
  }

  const lock = useCallback(async () => {
    await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'lock'
    })
    setIsLocked(true)
    setWallets([])
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
      console.log('vault start ping')
      await msgr?.ping(VAULT_SERVICE_WORKER_ID)
      console.log('vault keep alive')
      timeout = window.setTimeout(cb, 20000)
    }, 20000)

    const setup = async () => {
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register(new URL('../workers/Vault-Worker.ts', import.meta.url))

          registration.addEventListener('updatefound', () => {
            console.log('A new Vault worker is being installed')
            registration.installing?.addEventListener('statechange', () => {
              if ('installed' === registration.installing?.state) {
                console.log('Done installing new Vault worker')
              }
            })
          })

          if (registration.installing) {
            console.log('Vault worker installing')
          } else if (registration.waiting) {
            console.log('Vault worker installed')
          } else if (registration.active) {
            console.log('Vault worker active')

            // when in development mode
            // the service worker doesn't get updated automatically, so force it
            if (process.env.NODE_ENV === 'development') {
              console.log('Vault worker updating')
              await registration.update()
            }
          }

          console.log('Vault worker ready')

          vaultServiceWorker.current = registration

          msgr = new Messenger<OutgoingMessage, IncomingMessage>(registration.active!, 'vault-connector-child', false)
          vaultMessenger.current = msgr

        } catch (error) {
          console.error(`Vault worker registration failed with ${error}`)
        }
      }
    }

    setup()

    return () => {
      clearTimeout(timeout)
      msgr?.removeListener()

      if ('serviceWorker' in navigator) {
        console.log('Unregistering Vault worker')
        // registration?.unregister()
      }
    }
  }, [])

  const isVaultSetup = () => {
    return localStorage.getItem(VAULT_KEY) !== null
  }

  const addWallet = async (password: string, walletName: string, accountName: string, secretPhrase: string) => {
    const { result: isLockedResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'isLocked'
    })

    // unlock vault if necessary
    if (JSON.parse(isLockedResult!)) {
      await unlock(password)
    }

    // add wallet to vault
    const { result: addWalletResult } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'addWallet',
      arguments: JSON.stringify({
        walletName,
        accountName,
        secretPhrase
      })
    })

    const newWallets = JSON.parse(addWalletResult!)

    console.log('newWallets', newWallets)

    // save vault to localstorage
    const { result: serializedVault } = await vaultMessenger.current!.sendRequest(VAULT_SERVICE_WORKER_ID, {
      command: 'serialize',
      arguments: JSON.stringify({
        password
      })
    })

    localStorage.setItem(VAULT_KEY, serializedVault!)

    // update state
    setWallets(newWallets)
  }

  return (
    <WalletsContext.Provider value={{ wallets, unlock, lock, addWallet, isLocked, isVaultSetup }}>
      {children}
    </WalletsContext.Provider>
  )
}