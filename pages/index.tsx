import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useWallets } from '../context/WalletsProvider'

export default function Home() {
  const router = useRouter()
  const { wallets, isLoadingWallets } = useWallets()

  useEffect(() => {
    if (!isLoadingWallets) {
      if (wallets.length) {
        router.push('/dashboard')
      } else {
        router.push('/welcome')
      }
    }
  }, [router, wallets, isLoadingWallets])

  return (<></>)
}
