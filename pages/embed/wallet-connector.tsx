import { ReactElement, useEffect, useRef } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { debug } from '../../util/Utils'
import { handler as accountsHandler } from '../../wallet_connector_handlers/accountsHandler'
import { handler as signerHandler } from '../../wallet_connector_handlers/signerHandler'
import { handler as providerHandler } from '../../wallet_connector_handlers/providerHandler'
import { useNetworks } from '../../context/NetworksProvider'
import { MY_KOINOS_WALLET_CONNECTOR_PARENT_MESSENGER_ID, MY_KOINOS_WALLET_CONNECTOR_CHILD_MESSENGER_ID } from '../../util/Constants'
import { NextPageWithLayout } from '../_app'

export interface IncomingMessage {
  scope: string
  command: string
  arguments?: string
}

export interface OutgoingMessage {
  result: any
}

const WalletConnector: NextPageWithLayout = () => {
  const { isVaultSetup } = useWallets()
  const { provider } = useNetworks()

  const messenger = useRef<Messenger<IncomingMessage, OutgoingMessage>>()

  useEffect(() => {
    const msgr = new Messenger<IncomingMessage, OutgoingMessage>(parent.window, MY_KOINOS_WALLET_CONNECTOR_CHILD_MESSENGER_ID)
    messenger.current = msgr

    const setupMessenger = async () => {
      msgr.onRequest(async ({ sender, data, sendData, sendError }) => {
        if (!isVaultSetup) {
          window.open('/welcome', '_blank')
          sendError('request was cancelled')
        } else {
          switch (data.scope) {
            case 'accounts': {
              await accountsHandler(sender, data, sendData, sendError)
              break
            }

            case 'signer': {
              await signerHandler(sender, data, sendData, sendError, provider!)
              break
            }

            case 'provider': {
              await providerHandler(sender, data, sendData, sendError, provider!)
              break
            }

            default:
              sendError('invalid scope')
              break
          }
        }
      })

      await msgr.ping(MY_KOINOS_WALLET_CONNECTOR_PARENT_MESSENGER_ID)
      debug('connected to parent window')
    }

    setupMessenger()

    return () => {
      msgr.removeListener()
    }
  }, [isVaultSetup, provider])

  return (
    <></>
  )
}

WalletConnector.getLayout = function getLayout(page: ReactElement) {
  return (
    page
  )
}

export default WalletConnector