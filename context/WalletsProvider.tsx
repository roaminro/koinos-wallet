import { ReactNode, useContext, useState, createContext, useEffect, useMemo, useRef } from 'react'
import { VAULT_KEY } from '../util/Constants'
import { Vault, Wallet } from '../util/Vault'



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

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLocked, setIsLocked] = useState(true)
  const vault = useRef<Vault>(new Vault())

  const isVaultSetup = () => {
    return localStorage.getItem(VAULT_KEY) !== null
  }

  const unlock = async (password: string) => {
    const savedVault = localStorage.getItem(VAULT_KEY)

    if (savedVault) {
      const wallets = await vault.current.unlock(password, savedVault)
      console.log(wallets)
      setIsLocked(false)
      setWallets([...wallets])
    }
  }

  const lock = async () => {
    vault.current.lock()
    setIsLocked(true)
    setWallets([])
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