import Cookies from 'js-cookie'
import { logLevel } from '../app.config'
import { Messenger } from './Messenger'
import { defaultLocale } from '../i18n.js'

const CHARS = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const isAlphanumeric = (str: string) => {
  const characters = new Set(CHARS)
  for (let i = 0, len = str.length; i < len; i++) {
    if (!characters.has(str[i])) {
      return false
    }
  }

  return true
}

export const generateString = (length: number) => {
  let result = ' '
  const charactersLength = CHARS.length
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

export const equalArray = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export const debounce = (fn: Function, ms = 500) => {
  let timeoutId: number

  return function (this: any, ...args: any[]) {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => fn.apply(this, args), ms)
  }
}

export const truncateAccount = (account: string) => `${account.substring(0, 4)}...${account.substring(account.length - 4)}`

export const truncateTransactionId = (txId: string) => `${txId.substring(0, 11)}...${txId.substring(txId.length - 5)}`

export const debug = (...args: any) => {
  if (logLevel === 'debug') {
    console.log(...args)
  }
}

export const info = (...args: any) => {
  if (logLevel === 'info') {
    console.log(...args)
  }
}

export const saveFile = async (fileName: string, blob: Blob) => {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.target = '_blank'
  a.download = fileName
  a.addEventListener('click', () => {
    setTimeout(() => {
      URL.revokeObjectURL(href)
      document.body.removeChild(a)
    }, 30 * 1000)
  })
  document.body.appendChild(a)
  a.click()
}

export const getErrorMessage = (error: any) => {
  if ((error as Error).message) {
    try {
      const err = JSON.parse((error as Error).message)
      if (err.error) {
        return err.error
      } else {
        return (error as Error).message
      }
    } catch (_) {
      return (error as Error).message
    }
  }

  return String(error)
}

export const randomUUID = (): string => {
  if (!('randomUUID' in crypto)) {
    // https://stackoverflow.com/a/2117523/2800218
    // LICENSE: https://creativecommons.org/licenses/by-sa/4.0/legalcode
    return (
      //@ts-ignore
      [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
        (c: number) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
  }

  return crypto.randomUUID()
}

export const openPopup = <IncomingDataType, OutgoingDataType>(args: {
  url: string,
  messengerId: string,
  isTargetWindow?: boolean,
  targetOrigin?: string,
  width?: number,
  height?: number,
  onClose: () => void,
}) => {
  const { url, messengerId, isTargetWindow, targetOrigin, width, height, onClose } = args
  const fIsTargetWindow = isTargetWindow || true
  const fTargetOrigin = targetOrigin || window.location.origin
  const fWidth = width || 400
  const fHeight = height || 500

  const locale = Cookies.get('NEXT_LOCALE') || defaultLocale

  const params = `popup=yes,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,width=${fWidth},height=${fHeight}`
  const popupWindow = window.open(`/${locale}${url}`, 'mkw', params)!
  popupWindow.resizeTo(fWidth, fHeight)
  popupWindow.focus()

  const popupMessenger = new Messenger<IncomingDataType, OutgoingDataType>(popupWindow, messengerId, fIsTargetWindow, fTargetOrigin)

  popupWindow.onload = () => {
    popupWindow.onunload = () => {
      popupMessenger.removeListener()
      onClose()
    }
  }

  return { popupWindow, popupMessenger }
}