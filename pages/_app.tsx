import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import NiceModal from '@ebay/nice-modal-react'
import RouteGuard from '../components/RouteGuard'
import { WalletsProvider } from '../context/WalletsProvider'
import { NetworksProvider } from '../context/NetworksProvider'
import { TokensProvider } from '../context/TokensProvider'
import { ContactsProvider } from '../context/ContactsProvider'
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
              <ContactsProvider>
                <NiceModal.Provider>
                  <Head>
                    <title>My Koinos Wallet</title>
                    <meta
                      name="viewport"
                      content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
                    />
                    <link rel='manifest' href='/manifest.json' />
                  </Head>
                  <RouteGuard>
                    {
                      getLayout(<Component {...pageProps} />)
                    }
                  </RouteGuard>
                </NiceModal.Provider>
              </ContactsProvider>
            </TokensProvider>
          </WalletsProvider>
        </NetworksProvider>
      </PermissionsProvider>
    </ChakraProvider>
  )
}
