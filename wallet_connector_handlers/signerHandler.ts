import { Provider, Signer } from 'koilib'
import { SendTransactionOptions, TransactionJson, TransactionReceipt } from 'koilib/lib/interface'
import { IncomingMessage, OutgoingMessage } from '../pages/embed/wallet-connector'
import { Messenger, SendDataFn, SendErrorFn } from '../util/Messenger'
import { getErrorMessage } from '../util/Utils'

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

export interface PrepareTransactionArguments {
  signerAddress: string
  transaction: TransactionJson
}

export interface PrepareTransactionResult {
  transaction: TransactionJson
}

export const handler = (sender: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  switch (data.command) {
    case 'signTransaction': {
      return signSendTransaction(false, sender, data, sendData, sendError)
    }

    case 'signAndSendTransaction': {
      return signSendTransaction(true, sender, data, sendData, sendError)
    }

    case 'prepareTransaction': {
      return prepareTransaction(data, sendData, sendError, provider)
    }

    default:
      sendError('command not supported')
      break
  }
}

const prepareTransaction = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { signerAddress, transaction} = JSON.parse(data.arguments!) as PrepareTransactionArguments
    
    const dummySigner = Signer.fromSeed('dummy_signer')
    dummySigner.provider = provider

    if (!transaction.header) {
      transaction.header = {}
    }

    if (!transaction.header?.payer) {
      transaction.header.payer = signerAddress
    }
 
    sendData({ result: await dummySigner.prepareTransaction(transaction) })
  } catch (error) {
    sendError(getErrorMessage(error))
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
        sendError(getErrorMessage(error))
        resolve()
      }
    }

    newWindow.focus()
  })
}