import { ReactNode, useContext, useState, createContext, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY, PUBLIC_PATHS, VAULT_KEY } from '../util/Constants'
import { Vault, Wallet } from '../util/Vault'
import { getSetting, setSetting } from '../util/Settings'
import { debounce } from '../util/Utils'


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
  const vault = useRef<Vault>(new Vault())

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
    const savedVault = localStorage.getItem(VAULT_KEY)

    if (savedVault) {
      const wallets = await vault.current.unlock(password, savedVault)
      console.log(wallets)
      setIsLocked(false)
      setWallets([...wallets])
    }
  }

  const lock = useCallback(async () => {
    vault.current.lock()
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

  const isVaultSetup = () => {
    return localStorage.getItem(VAULT_KEY) !== null
  }

  const addWallet = async (password: string, walletName: string, accountName: string, secretPhrase: string) => {
    // unlock vault if necessary
    if (vault.current.isLocked()) {
      await unlock(password)
    }

    // add wallet to vault
    const newWallets = await vault.current.addWallet(walletName, accountName, secretPhrase)

    // save vault to localstorage
    localStorage.setItem(VAULT_KEY, await vault.current.serialize(password))

    // update state
    setWallets(newWallets)
  }

  return (
    <WalletsContext.Provider value={{ wallets, unlock, lock, addWallet, isLocked, isVaultSetup }}>
      {children}
    </WalletsContext.Provider>
  )
}