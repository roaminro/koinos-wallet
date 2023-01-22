import { IncomingMessage, OutgoingMessage } from '../pages/embed/wallet-connector'
import { ACCOUNTS_PARENT_ID } from '../util/Constants'
import { SendDataFn, SendErrorFn } from '../util/Messenger'
import { getErrorMessage, openPopup } from '../util/Utils'

export interface IAccount {
  address: string
  signers?: {
    address: string,
  }[]
}

export interface GetAccountsArguments {
  requester: string
}

export type GetAccountsResult = IAccount[]

export const handler = (sender: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn) => {
  switch (data.command) {
    case 'getAccounts': {
      return getAccounts(sender, data, sendData, sendError)
    }

    default:
      sendError('command not supported')
      break
  }
}

const getAccounts = (requester: string, _: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn) => {
  return new Promise<void>((resolve) => {
    try {
      const { popupWindow, popupMessenger } = openPopup<GetAccountsResult, GetAccountsArguments>({
        url: '/embed/getAccounts',
        messengerId: ACCOUNTS_PARENT_ID,
        onClose: () => {
          sendError('request was cancelled')
          resolve()
        },
      })

      popupMessenger.onMessage(({ data: accounts }) => {
        sendData({ result: accounts })
        popupWindow.close()
        resolve()
      })

      popupMessenger.onRequest(({ sendData }) => {
        sendData({ requester })
      })
    } catch (error) {
      sendError(getErrorMessage(error))
      resolve()
    }
  })
}