import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import RouteGuard from '../components/RouteGuard'
import { WalletsProvider } from '../context/WalletsProvider'
import { NetworksProvider } from '../context/NetworksProvider'
import { TokensProvider } from '../context/TokensProvider'
import theme from '../styles/theme'
import { ReactElement, ReactNode } from 'react'
import { NextPage } from 'next'
import Sidebar from '../components/Sidebar'
import { PermissionsProvider } from '../context/PermissionsProvider'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {

  const getLayout = Component.getLayout ?? ((page) => <Sidebar>{page}</Sidebar>)

  return (
    <ChakraProvider theme={theme}>
      <PermissionsProvider>
        <NetworksProvider>
          <WalletsProvider>
            <TokensProvider>
              <Head>
                <title>My Koinos Wallet</title>
                <meta
                  name="viewport"
                  content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
                />
              </Head>
              <RouteGuard>
                {
                  getLayout(<Component {...pageProps} />)
                }
              </RouteGuard>
            </TokensProvider>
          </WalletsProvider>
        </NetworksProvider>
      </PermissionsProvider>
    </ChakraProvider>
  )
}
