import React, { useState, useEffect, ReactNode, ReactElement, useCallback } from 'react'
import { useRouter } from 'next/router'

import { getSetting, setSetting } from '../util/Settings'
import { debounce } from '../util/Utils'
import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY } from '../util/Constants'

export default function LockGuard({
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

  useEffect(() => {
    // check autolock timeout every minute
    let checkAutoLockTimeout: number
    checkAutoLockTimeout = window.setTimeout(function cb() {
      authCheck(router.asPath)
      checkAutoLockTimeout = window.setTimeout(cb, 60000)
    }, 60000)

    const interactionEvents = ['click', 'keydown', 'scroll']

    // interactions handling
    const eventHandler = (ev:any) => {
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
  }, [authCheck, router])


  return (
    <>
      {authorized && children}
    </>
  )
}