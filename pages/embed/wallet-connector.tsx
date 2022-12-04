import { useEffect, useRef, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { debug } from '../../util/Utils'
import { handler as accountsHandler, IAccount } from '../../wallet_connector_handlers/accountsHandler'

export interface IncomingMessage {
  scope: string
  command: string
  arguments?: string
}

export interface OutgoingMessage {
  result: IAccount[]
}

export default function WalletConnector() {
  const { isVaultSetup } = useWallets()

  const messenger = useRef<Messenger<IncomingMessage, OutgoingMessage>>()

  useEffect(() => {
    const msgr = new Messenger<IncomingMessage, OutgoingMessage>(parent.window, 'wallet-connector-child')
    messenger.current = msgr

    const setupMessenger = async () => {
      msgr.onRequest(async ({ sender, data, sendData, sendError }) => {
        if (!isVaultSetup()) {
          window.open('/welcome', '_blank')
          sendError('request was cancelled')
        } else {
          switch (data.scope) {
            case 'accounts': {
              await accountsHandler(sender, data, sendData, sendError)
              break
            }

            default:
              sendError('invalid scope')
              break
          }
        }
      })

      await msgr.ping('wallet-connector-parent')
      debug('connected to parent window')
    }

    setupMessenger()

    return () => {
      msgr.removeListener()
    }
  }, [isVaultSetup])

  return (
    <></>
  )
}