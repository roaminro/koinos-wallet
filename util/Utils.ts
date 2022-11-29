const CHARS = new Set('_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
export const isAlphanumeric = (str: string) => {
  for (let i = 0, len = str.length; i < len; i++) {
    if (!CHARS.has(str[i])) {
      return false
    }
  }

  return true
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
