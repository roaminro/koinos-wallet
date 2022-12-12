import { SendTransactionOptions, TransactionJson, TransactionReceipt } from 'koilib/lib/interface'
import { IncomingMessage, OutgoingMessage } from '../pages/embed/wallet-connector'
import { Messenger, SendDataFn, SendErrorFn } from '../util/Messenger'

export interface SignSendTransactionArguments {
  requester: string
  signerAddress: string
  send: boolean
  transaction: TransactionJson
  options: SendTransactionOptions
}

export interface SignSendTransactionResult {
  receipt?: TransactionReceipt
  transaction: TransactionJson
}

export const handler = (sender: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn) => {
  switch (data.command) {
    case 'signTransaction': {
      return signSendTransaction(false, sender, data, sendData, sendError)
    }

    case 'signAndSendTransaction': {
      return signSendTransaction(true, sender, data, sendData, sendError)
    }

    default:
      sendError('command not supported')
      break
  }
}

const signSendTransaction = (send: boolean, requester: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn) => {
  return new Promise<void>((resolve) => {
    const params = 'popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=450,height=550'
    const newWindow = window.open('/embed/signSendTransaction', 'Transaction', params)!
    newWindow.resizeTo(450, 550)

    newWindow.onload = async () => {
      try {
        const popupMsgr = new Messenger<SignSendTransactionResult, SignSendTransactionArguments>(newWindow, 'sign-send-transaction-popup-parent', true, window.location.origin)

        newWindow.onunload = () => {
          popupMsgr.removeListener()
          sendError('request was cancelled')
          resolve()
        }

        popupMsgr.onMessage(({ data }) => {
          sendData({ result: data })
          popupMsgr.removeListener()
          newWindow.close()
          resolve()
        })

        popupMsgr.onRequest(({ sendData }) => {
          const args = JSON.parse(data.arguments!) as SignSendTransactionArguments
          args.requester = requester
          args.send = send
          sendData(args)
        })
      } catch (error) {
        sendError('request was cancelled')
        resolve()
      }
    }

    newWindow.focus()
  })
}