import React, { useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/router'

import { PUBLIC_PATHS } from '../util/Constants'
import { useWallets } from '../context/WalletsProvider'

export default function RouteGuard({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter()
  const { isLocked } = useWallets()
  const [authorized, setAuthorized] = useState(false)

  const authCheck = useCallback((url: string) => {
    const path = url.split('?')[0]
    setAuthorized(!isLocked || PUBLIC_PATHS.includes(path))
  }, [isLocked])

  useEffect(() => {
    const hideContent = () => setAuthorized(false)

    const setup = async () => {
      // on route change start - hide page content by setting authorized to false  
      router.events.on('routeChangeStart', hideContent)

      // on route change complete - run auth check 
      router.events.on('routeChangeComplete', authCheck)

      // on initial load - run auth check 
      authCheck(router.asPath)
    }

    setup()

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', authCheck)
    }
  }, [authCheck, router.asPath, router.events])

  return (
    <>
      {authorized && children}
    </>
  )
}