import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import RouteGuard from '../components/RouteGuard'
import { WalletsProvider } from '../context/WalletsProvider'
import { NetworksProvider } from '../context/NetworksProvider'
import { TokensProvider } from '../context/TokensProvider'
import theme from '../styles/theme'

export default function App({ Component, pageProps }: AppProps) {

  return (
    <ChakraProvider theme={theme}>
      <NetworksProvider>
        <WalletsProvider>
          <TokensProvider>
            <Head>
              <title>My Koinos Wallet</title>
              <meta
                name="viewport"
                content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
              />
              <link rel='manifest' href='/manifest.json' />
            </Head>
            <RouteGuard>
              <Component {...pageProps} />
            </RouteGuard>
          </TokensProvider>
        </WalletsProvider>
      </NetworksProvider>
    </ChakraProvider>
  )
}
