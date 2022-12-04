import { useEffect, useRef, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { Account } from '../../util/Vault'
import { useWallets } from '../../context/WalletsProvider'

interface IncomingMessage {
  command: string
  arguments?: string
}

interface OutgoingMessage {
  result: Account[]
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
          sendError('wallet not setup')
        } else if (data.command === 'get-accounts') {
          return new Promise((resolve) => {
            const params = 'popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=400,height=500'
            const newWindow = window.open('/embed/accounts', 'Accounts', params)!
            newWindow.resizeTo(400, 500)

            newWindow.onload = async () => {  //wait til load to add onunload event
              try {
                const popupMsgr = new Messenger<Account[], string>(newWindow, 'accounts-popup-parent', true, window.location.origin)
                newWindow.onunload = () => {
                  popupMsgr.removeListener()
                  sendError('request was cancelled')
                  resolve()
                }

                popupMsgr.onMessage(({ data: accounts }) => {
                  sendData({ result: accounts })
                  popupMsgr.removeListener()
                  newWindow.close()
                  resolve()
                })

                popupMsgr.onRequest(({ sendData }) => {
                  sendData(sender)
                })
              } catch (error) {
                sendError('request was cancelled')
                resolve()
              }
            }

            newWindow.focus()
          })
        }
      })

      await msgr.ping('wallet-connector-parent')
      console.log('connected to parent window')
    }

    setupMessenger()

    return () => {
      msgr.removeListener()
      console.log('removed')
    }
  }, [])

  return (
    <></>
  )
}