import React, { useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/router'

import { getSetting, setSetting } from '../util/Settings'
import { debounce } from '../util/Utils'
import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY } from '../util/Constants'
import { useWallets } from '../context/WalletsProvider'

export default function LockGuard({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter()
  const { lock, isLocked } = useWallets()
  const [authorized, setAuthorized] = useState(false)

  const authCheck = useCallback(async (url: string) => {
    const publicPaths = [
      '/',
      '/unlock',
      '/welcome',
      '/create-wallet',
      '/import-wallet',
      '/embed/wallet-connector'
    ]

    const path = url.split('?')[0]

    const autolockDeadlineStr = getSetting<number>(AUTOLOCK_DEADLINE_KEY)

    let canRedirectToUnlock = false

    if (autolockDeadlineStr) {
      const now = new Date()
      const autolockDeadline = new Date(autolockDeadlineStr)

      if (now >= autolockDeadline) {
        await lock()
        canRedirectToUnlock = true
      }
    }

    if (canRedirectToUnlock && !publicPaths.includes(path)) {
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
    const hideContent = () => setAuthorized(false)

    const setup = async () => {
      // on initial load - run auth check 
      await authCheck(router.asPath)

      // on route change start - hide page content by setting authorized to false  
      router.events.on('routeChangeStart', hideContent)

      // on route change complete - run auth check 
      // router.events.on('routeChangeComplete', async (ev) => await authCheck(ev))
      router.events.on('routeChangeComplete', authCheck)
    }

    setup()

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', authCheck)
    }
  }, [authCheck, router.asPath, router.events])

  useEffect(() => {
    // check autolock timeout every minute
    let checkAutoLockTimeout: number
    checkAutoLockTimeout = window.setTimeout(async function cb() {
      await authCheck(router.asPath)
      checkAutoLockTimeout = window.setTimeout(cb, 60000)
    }, 60000)

    const interactionEvents = ['click', 'keydown', 'scroll']

    // interactions handling
    const eventHandler = (ev: any) => {
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
  }, [authCheck, isLocked, router])


  return (
    <>
      {authorized && children}
    </>
  )
}