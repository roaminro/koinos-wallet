import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import RouteGuard from '../components/RouteGuard'
import { WalletsProvider } from '../context/WalletsProvider'

export default function App({ Component, pageProps }: AppProps) {

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
