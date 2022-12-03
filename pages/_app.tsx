import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import RouteGuard from '../components/RouteGuard'
import { WalletsProvider } from '../context/WalletsProvider'
import { useEffect, useRef } from 'react'
import { Messenger } from '../util/Messenger'

export default function App({ Component, pageProps }: AppProps) {

  const workerRef = useRef<ServiceWorkerRegistration>()


  useEffect(() => {
    const listener = function (event: any) {
      console.log(`WebWorker Response => ${event.data}`)
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', listener)
    }

    let registration: ServiceWorkerRegistration

    
    let interval = window.setInterval(async () => {
      const msgr = new Messenger<number, number>(workerRef.current?.active!, 'vault-connector-child', false)
      // await msgr.ping('vault')
      const res = await msgr.sendRequest('vault', 2)
      console.log('res', res, new Date().toLocaleString())
      document.title = `${res} / ${new Date().toLocaleString()}`
    }, 20000)

    const registerServiceWorker = async () => {

      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register(new URL('../workers/Vault-Worker.ts', import.meta.url))

          registration.addEventListener('updatefound', () => {
            // If updatefound is fired, it means that there's
            // a new service worker being installed.
            const installingWorker = registration.installing
            console.log(
              'A new service worker is being installed:',
              installingWorker
            )
          })

          if (registration.installing) {
            console.log('Service worker installing')
            await registration.waiting
          } else if (registration.waiting) {
            console.log('Service worker installed')
          } else if (registration.active) {
            console.log('Service worker active')

            // when in development mode
            // the service worker doesn't get updated automatically, so force it
            if (process.env.NODE_ENV === 'development') {
              console.log('Service worker updating')
              await registration.update()
            }
          }

          console.log('Service worker ready')

          workerRef.current = registration

        } catch (error) {
          console.error(`Registration failed with ${error}`)
        }
      }
    }

    registerServiceWorker()

    return () => {
      clearInterval(interval)
      if ('serviceWorker' in navigator) {
        console.log('unregistering')
        registration?.unregister()
      }
    }
  }, [])

  return (
    <ChakraProvider>
      <WalletsProvider>
        <Head>
          <title>Wallet</title>
          <meta
            name="viewport"
            content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
          />
        </Head>
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      </WalletsProvider>
    </ChakraProvider>
  )
}
