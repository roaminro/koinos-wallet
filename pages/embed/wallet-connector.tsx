import { useEffect, useLayoutEffect, useState } from 'react'
import { Account } from '../../util/HDKoinos'
import { Messenger } from '../../util/Messenger'

export default function WalletConnector() {
  interface Message {
    msg: string
  }

  const [messenger, setMessenger] = useState<Messenger<Message, Message>>()

  useEffect(() => {
    const t = sessionStorage.getItem('test')

    if (!t) {
      sessionStorage.setItem('test', crypto.randomUUID())
    } else {
      console.log('sessionStorage "test"', t)
    }

    const msgr = new Messenger<Message, Message>(parent.window)
    setMessenger(msgr)

    const unlock = (sender: string) => {
      // TODO: allow for unlocking for X amount of time
      return new Promise<void>((resolve, reject) => {
        let params = 'popup=yes,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=300,height=300,left=-1000,top=-1000'
        const newWindow = window.open('/embed/unlock', 'unloack wallet', params)!

        newWindow.onload = async () => {
          const popupMsgr = new Messenger<Account[], string>(newWindow, window.location.origin)
          newWindow.onunload = (e) => {
            popupMsgr.removeListener()
            reject()
          }

          popupMsgr.onMessage(({ data: accounts }) => {
            popupMsgr.removeListener()
            newWindow.close()
            resolve()
          })

          await popupMsgr.connect()
          console.log('connected to unlock popup')
          await popupMsgr.sendMessage(sender)
        }

        newWindow.focus()
      })
    }

    const setupMessenger = async () => {
      msgr.onRequest(async ({ sender, data, sendData, sendError }) => {
        console.log('onRequest iframe', data)
        if (data.msg === 'test') {
          sendData({ msg: 'test from iframe' })
          // sendError('test from iframe')
        } else if (data.msg === 'popup') {
          return new Promise((resolve) => {
            const params = 'popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=400,height=500'
            const newWindow = window.open('/embed/accounts', 'Accounts', params)!
            newWindow.resizeTo(400, 500)

            newWindow.onload = async () => {  //wait til load to add onunload event
              try {
                const popupMsgr = new Messenger<Message, string>(newWindow, window.location.origin)
                newWindow.onunload = () => {
                  popupMsgr.removeListener()
                  sendError('request was cancelled')
                  resolve()
                }

                popupMsgr.onMessage(({ data }) => {
                  sendData(data)
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