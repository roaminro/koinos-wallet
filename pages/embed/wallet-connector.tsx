import { useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { IAccount } from './accounts'

interface IncomingMessage {
  method: string
  arguments?: string
}

interface OutgoingMessage {
  result: IAccount[]
}

export default function WalletConnector() {

  const [messenger, setMessenger] = useState<Messenger<IncomingMessage, OutgoingMessage>>()

  useEffect(() => {
    const msgr = new Messenger<IncomingMessage, OutgoingMessage>(parent.window, 'wallet-connector-child')
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onMessage(({ data, sender }) => {
        console.log('msgr received', data)
      })

      msgr.onRequest(async ({ sender, data, sendData, sendError }) => {
        console.log('onRequest iframe', data)

        if (data.method === 'getAccounts') {
          return new Promise((resolve) => {
            const params = 'popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=400,height=500'
            const newWindow = window.open('/embed/accounts', 'Accounts', params)!
            newWindow.resizeTo(400, 500)

            newWindow.onload = async () => {  //wait til load to add onunload event
              try {
                const popupMsgr = new Messenger<IAccount[], string>(newWindow, 'accounts-popup-parent', true, window.location.origin)
                newWindow.onunload = () => {
                  popupMsgr.removeListener()
                  sendError('request was cancelled')
                  resolve()
                }

                popupMsgr.onMessage(({ data: accounts }) => {
                  console.log('popupMsgr received', accounts)
                  sendData({ result: accounts })
                  popupMsgr.removeListener()
                  newWindow.close()
                  resolve()
                })

                await popupMsgr.ping('accounts-popup-child', 100)
                popupMsgr.sendMessage('accounts-popup-child', sender)
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