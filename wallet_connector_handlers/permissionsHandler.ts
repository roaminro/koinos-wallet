import getUuidByString from 'uuid-by-string'
import { AppPermissions, Permissions } from '../context/PermissionsProvider'
import { IncomingMessage, OutgoingMessage } from '../pages/embed/wallet-connector'
import { Messenger, SendDataFn, SendErrorFn } from '../util/Messenger'
import { getErrorMessage } from '../util/Utils'

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
    const params = 'popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=450,height=550'
    const newWindow = window.open('/embed/requestPermissions', 'Permissions', params)!
    newWindow.resizeTo(450, 550)

    newWindow.onload = async () => {
      try {
        const popupMsgr = new Messenger<RequestPermissionsResult, RequestPermissionsArguments>(newWindow, 'request-permissions-popup-parent', true, window.location.origin)

        newWindow.onunload = () => {
          popupMsgr.removeListener()
          sendError('request was cancelled')
          resolve()
        }

        popupMsgr.onMessage(( { data: permissionsResult }) => {
          const id = getUuidByString(requester)
          updateAppPermissions({
            id,
            url: requester,
            permissions: permissionsResult.permissions
          })
          sendData({ result: permissionsResult })
          popupMsgr.removeListener()
          newWindow.close()
          resolve()
        })

        popupMsgr.onRequest(({ sendData }) => {
          const args = JSON.parse(data.arguments!) as RequestPermissionsArguments
          args.requester = requester
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