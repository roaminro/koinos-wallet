import { ReactNode, useContext, useState, createContext, useEffect } from 'react'
import { Account } from '../util/HDKoinos'

const WALLETS_KEY = 'WALLETS'

export type Wallet = {
  name: string
  secretPhrase: string
  accounts: Account[]
}

type WalletContextType = {
  wallets: Wallet[]
  addWallet: (wallet: Wallet) => void
  isLoadingWallets: boolean
}

export const WalletsContext = createContext<WalletContextType>({
  wallets: [],
  addWallet: () => {},
  isLoadingWallets: true
})

export const useWallets = () => useContext(WalletsContext)

export const WalletsProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoadingWallets, setIsLoadingWallets] = useState(true)

  useEffect(() => {
    const savedWallets = localStorage.getItem(WALLETS_KEY)

    if (savedWallets) {
      setWallets(JSON.parse(savedWallets))
    }
  
    setIsLoadingWallets(false) 
  }, [])

  useEffect(() => {
    if (!wallets.length) return
    localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
  }, [wallets])

  const addWallet = (wallet: Wallet) => {
    setWallets([...wallets, wallet])
  }

  return (
    <WalletsContext.Provider value={{ wallets, addWallet, isLoadingWallets }}>
      {children}
    </WalletsContext.Provider>
  )
}