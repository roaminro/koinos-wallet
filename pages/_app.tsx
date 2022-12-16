import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Alert, AlertIcon, ChakraProvider, CloseButton, useBoolean } from '@chakra-ui/react'
import Head from 'next/head'
import RouteGuard from '../components/RouteGuard'
import { WalletsProvider } from '../context/WalletsProvider'
import { NetworksProvider } from '../context/NetworksProvider'

export default function App({ Component, pageProps }: AppProps) {
  const [flag, setFlag] = useBoolean()

  return (
    <ChakraProvider>
      <NetworksProvider>
        <WalletsProvider>
          <Head>
            <title>My Koinos Wallet</title>
            <meta
              name="viewport"
              content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
            />
          </Head>
          {
            !flag && <Alert status='warning'>
              <AlertIcon />
              My Koinos Wallet is still a work in progress and breaking changes may happen. Make sure to export your Vault everytime you create a new wallet.
              <CloseButton onClick={setFlag.toggle} />
            </Alert>
          }
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
        </WalletsProvider>
      </NetworksProvider>
    </ChakraProvider>
  )
}
