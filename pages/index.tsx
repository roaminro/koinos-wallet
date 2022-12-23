import { useRouter } from 'next/router'
import { useWallets } from '../context/WalletsProvider'

export default function Home() {
  const router = useRouter()
  const { isVaultSetup, isLoading } = useWallets()

  if (!isLoading) {
    if (!isVaultSetup) {
      router.push('/welcome')
    } else {
      router.push('/home')
    }
  }

  return (<></>)
}
