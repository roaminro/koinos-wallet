import { logLevel } from '../app.config'

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
  const a = document.createElement('a')
  a.download = fileName
  a.href = URL.createObjectURL(blob)
  a.addEventListener('click', () => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000)
  })
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