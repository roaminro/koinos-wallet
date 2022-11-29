import React, { useState, useEffect, ReactNode, ReactElement } from 'react'
import { useRouter } from 'next/router'

import { getSetting, setSetting } from '../util/Settings'

const AUTOLOCK_DEADLINE_KEY = 'AUTOLOCK_DEADLINE'

export default function RouteGuard({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  const checkAutoLock = () => {
    const autolockDeadlineStr = getSetting<number>(AUTOLOCK_DEADLINE_KEY)

    if (autolockDeadlineStr) {
      const now = new Date()
      const autolockDeadline = new Date(autolockDeadlineStr)

      if (now >= autolockDeadline) {
        setSetting(AUTOLOCK_DEADLINE_KEY, 0)
      } else {
        return true
      }
    }

    return false
  }


  useEffect(() => {
    const interval = setInterval(() => {
      checkAutoLock()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // on initial load - run auth check 
    authCheck(router.asPath)

    // on route change start - hide page content by setting authorized to false  
    const hideContent = () => setAuthorized(false)
    router.events.on('routeChangeStart', hideContent)

    // on route change complete - run auth check 
    router.events.on('routeChangeComplete', authCheck)

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', authCheck)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function authCheck(url: string) {
    // redirect to unlock page if accessing a private page and not unlocked 
    const publicPaths = [
      '/unlock',
      '/welcome',
      '/create-wallet',
      '/import-wallet',
      '/embed/wallet-connector'
    ]

    const path = url.split('?')[0]

    if (!checkAutoLock() && !publicPaths.includes(path)) {
      setAuthorized(false)
      router.push({
        pathname: '/unlock',
        query: { returnUrl: router.asPath }
      })
    } else {
      setAuthorized(true)
    }
  }

  return (
    <>
      {authorized && children}
    </>
  )
}