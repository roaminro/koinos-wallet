import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import LockGuard from '../components/LockGuard'
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
        <LockGuard>
          <Component {...pageProps} />
        </LockGuard>
      </WalletsProvider>
    </ChakraProvider>
  )
}
