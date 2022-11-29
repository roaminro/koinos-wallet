import { SETTINGS_KEY } from './Constants'

export const getSettings = () => {
  const obj = localStorage.getItem(SETTINGS_KEY)

  if (obj) {
    return JSON.parse(obj)
  }

  return null
}

export const getSetting = <T>(key: string): T | null => {
  const obj = localStorage.getItem(SETTINGS_KEY)

  if (obj) {
    const settings = JSON.parse(obj)

    if (settings[key]) {
      return settings[key]
    } else {
      return null
    }
  }

  return null
}

export const setSetting = (key: string, value: any) => {
  let obj = localStorage.getItem(SETTINGS_KEY)

  if (!obj) {
    obj = '{}'
  }

  const settings = JSON.parse(obj)
  settings[key] = value

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}