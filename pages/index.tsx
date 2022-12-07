import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useWallets } from '../context/WalletsProvider'

export default function Home() {
  const router = useRouter()
  const { isVaultSetup, isLoading } = useWallets()

  useEffect(() => {
    if (!isLoading) {
      if (!isVaultSetup) {
        router.push('/welcome')
      } else {
        router.push('/dashboard')
      }
    }
  }, [router, isVaultSetup, isLoading])

  return (<></>)
}
