import React, { useState, useEffect, ReactNode, ReactElement, useCallback } from 'react'
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

  const authCheck = useCallback((url: string) => {
    const publicPaths = [
      '/',
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
  }, [router])


  useEffect(() => {
    console.log('start checkAutoLock')

    let timeout: number
    timeout = window.setTimeout(function cb() {
      console.log('checkAutoLock')
      authCheck(router.asPath)
      timeout = window.setTimeout(cb, 5000)
    }, 5000)

    return () => {
      console.log('clear checkAutoLock')
      window.clearTimeout(timeout)
    }
  }, [authCheck, router])

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
  }, [authCheck, router.asPath, router.events])

  return (
    <>
      {authorized && children}
    </>
  )
}