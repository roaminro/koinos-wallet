import { useEffect, useState } from 'react'
import { decrypt, encrypt } from '../util/Encryption'

const PASSWORD_CHECKER_KEY = 'PASSWORD_CHECKER'

export const usePasswordManager = () => {
  const [passwordChecker, setPasswordChecker] = useState<string>()
  const [isLoadingPasswordManager, setisLoadingPasswordManager] = useState(true)

  useEffect(() => {
    const pwdChecker = localStorage.getItem(PASSWORD_CHECKER_KEY)

    if (pwdChecker) {
      setPasswordChecker(pwdChecker)
    }

    setisLoadingPasswordManager(false)
  }, [])

  useEffect(() => {
    if (passwordChecker) {
      localStorage.setItem(PASSWORD_CHECKER_KEY, passwordChecker)
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