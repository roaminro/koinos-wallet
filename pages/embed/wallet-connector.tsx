import { ReactElement, useEffect, useRef } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { debug } from '../../util/Utils'
import { handler as accountsHandler } from '../../wallet_connector_handlers/accountsHandler'
import { handler as signerHandler } from '../../wallet_connector_handlers/signerHandler'
import { handler as providerHandler } from '../../wallet_connector_handlers/providerHandler'
import { handler as permissionsHandler } from '../../wallet_connector_handlers/permissionsHandler'
import { useNetworks } from '../../context/NetworksProvider'
import { MY_KOINOS_WALLET_CONNECTOR_PARENT_MESSENGER_ID, MY_KOINOS_WALLET_CONNECTOR_CHILD_MESSENGER_ID } from '../../util/Constants'
import { NextPageWithLayout } from '../_app'
import { usePermissions } from '../../context/PermissionsProvider'
import getUuidByString from 'uuid-by-string'

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
  const { permissions, updateAppPermissions } = usePermissions()

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
          const appId = getUuidByString(sender)
          if (data.scope === 'permissions' ||
            (
              permissions[appId]
              && permissions[appId].permissions[data.scope]
              && permissions[appId].permissions[data.scope].includes(data.command)
            )
          ) {
            switch (data.scope) {
              case 'permissions': {
                await permissionsHandler(sender, data, sendData, sendError, updateAppPermissions)
                break
              }

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
          } else {
            sendError(`unauthorized: scope ${data.scope} / command: ${data.command}`)
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
  }, [isVaultSetup, permissions, provider, updateAppPermissions])

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