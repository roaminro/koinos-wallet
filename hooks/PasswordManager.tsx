import { useEffect, useState } from 'react'
import { PASSWORD_CHECKER_KEY } from '../util/Constants'
import { decrypt, encrypt } from '../util/Encryption'
import { getSetting, setSetting } from '../util/Settings'

export const usePasswordManager = () => {
  const [passwordChecker, setPasswordChecker] = useState<string>()
  const [isLoadingPasswordManager, setisLoadingPasswordManager] = useState(true)

  useEffect(() => {
    const pwdChecker = getSetting<string>(PASSWORD_CHECKER_KEY)

    if (pwdChecker) {
      setPasswordChecker(pwdChecker)
    }

    setisLoadingPasswordManager(false)
  }, [])

  useEffect(() => {
    if (passwordChecker) {
      setSetting(PASSWORD_CHECKER_KEY, passwordChecker)
    }
  }, [passwordChecker])

  const updatePassword = async (password: string) => {
    const enc = await encrypt(PASSWORD_CHECKER_KEY, password)

    setPasswordChecker(enc)
  }

  const checkPassword = async (password: string) => {
    if (!passwordChecker) {
      throw new Error('password not set')
    }

    await decrypt(passwordChecker, password)
  }

  return {
    isLoadingPasswordManager,
    passwordChecker,
    checkPassword, 
    updatePassword
  }
}