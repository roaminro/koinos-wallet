import React, { ReactNode } from 'react'
import { useRouter } from 'next/router'

import { PUBLIC_PATHS } from '../util/Constants'
import { useWallets } from '../context/WalletsProvider'

export default function RouteGuard({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter()
  const { isLocked, isLoading } = useWallets()
  
  const path = router.asPath.split('?')[0]
  const authorized = !isLocked || PUBLIC_PATHS.includes(path)

  return (
    <>
      {!isLoading && authorized && children}
    </>
  )
}