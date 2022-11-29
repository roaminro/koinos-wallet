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
    const t = sessionStorage.getItem('test')

    if (!t) {
      sessionStorage.setItem('test', crypto.randomUUID())
    } else {
      console.log('sessionStorage "test"', t)
    }

    const msgr = new Messenger<IncomingMessage, OutgoingMessage>(parent.window)
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onRequest(async ({ sender, data, sendData, sendError }) => {
        console.log('onRequest iframe', data)

        if (data.method === 'getAccounts') {
          return new Promise((resolve) => {
            const params = 'popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=400,height=500'
            const newWindow = window.open('/embed/accounts', 'Accounts', params)!
            newWindow.resizeTo(400, 500)

            newWindow.onload = async () => {  //wait til load to add onunload event
              try {
                const popupMsgr = new Messenger<IAccount[], string>(newWindow, window.location.origin)
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

                await popupMsgr.connect(100)
                console.log('connected to popup')
                await popupMsgr.sendMessage(sender)
              } catch (error) {
                sendError('request was cancelled')
                resolve()
              }
            }

            newWindow.focus()
          })
        }
      })

      await msgr.connect()
      console.log('connected to parent')

      await msgr.sendRequest({ msg: 'hello' }, 2000)
    }

    setupMessenger()

    return () => {
      msgr.removeListener()
      console.log('removed')
    }
  }, [])

  return (
    <>
      WalletConnector
    </>
  )
}