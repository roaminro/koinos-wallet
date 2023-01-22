import getUuidByString from 'uuid-by-string'
import { AppPermissions, Permissions } from '../context/PermissionsProvider'
import { IncomingMessage, OutgoingMessage } from '../pages/embed/wallet-connector'
import { REQUEST_PERMISSIONS_PARENT_ID } from '../util/Constants'
import { SendDataFn, SendErrorFn } from '../util/Messenger'
import { getErrorMessage, openPopup } from '../util/Utils'

export interface RequestPermissionsArguments {
  requester: string
  permissions: Permissions
}

export interface RequestPermissionsResult {
  permissions: Permissions
}

export const handler = (sender: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, updateAppPermissions: (appPermissions: AppPermissions) => void) => {
  switch (data.command) {
    case 'requestPermissions': {
      return requestPermissions(sender, data, sendData, sendError, updateAppPermissions)
    }

    default:
      sendError('command not supported')
      break
  }
}

const requestPermissions = (requester: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, updateAppPermissions: (appPermissions: AppPermissions) => void) => {
  return new Promise<void>((resolve) => {
    try {
      const { popupWindow, popupMessenger } = openPopup<RequestPermissionsResult, RequestPermissionsArguments>({
        url: '/embed/requestPermissions',
        messengerId: REQUEST_PERMISSIONS_PARENT_ID,
        onClose: () => {
          sendError('request was cancelled')
          resolve()
        },
      })

      popupMessenger.onMessage(({ data: permissionsResult }) => {
        const id = getUuidByString(requester)
        updateAppPermissions({
          id,
          url: requester,
          permissions: permissionsResult.permissions
        })
        sendData({ result: permissionsResult })
        popupWindow.close()
        resolve()
      })

      popupMessenger.onRequest(({ sendData }) => {
        const args = JSON.parse(data.arguments!) as RequestPermissionsArguments
        args.requester = requester
        sendData(args)
      })
    } catch (error) {
      sendError(getErrorMessage(error))
      resolve()
    }
  })
}