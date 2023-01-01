import { ReactNode, useContext, useState, createContext, useEffect } from 'react'
import appConfig from '../app.config'
import { TOKENS_KEY } from '../util/Constants'

export type Token = {
  chainId: string
  address: string
  name: string
  symbol: string
  decimals: number
}

type TokensContextType = {
  tokens: Record<string, Token>
  addToken: (token: Token) => void
  updateToken: (token: Token) => void
  removeToken: (token: Token) => void
}

export const TokensContext = createContext<TokensContextType>({
  tokens: appConfig.defaultTokens,
  addToken: (token: Token) => { },
  updateToken: (token: Token) => { },
  removeToken: (token: Token) => { }
})

export const useTokens = () => useContext(TokensContext)

export const TokensProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const [tokens, setTokens] = useState<Record<string, Token>>({})

  useEffect(() => {
    const savedTokens = localStorage.getItem(TOKENS_KEY)

    if (savedTokens) {
      setTokens(JSON.parse(savedTokens))
    } else {
      setTokens(appConfig.defaultTokens)
      saveToLocalStorage(appConfig.defaultTokens)
    }

    const onStorageUpdate = (e: StorageEvent) => {
      const { key, newValue } = e
      if (newValue && key === TOKENS_KEY) {
        setTokens(JSON.parse(newValue))
      }
    }

    window.addEventListener('storage', onStorageUpdate)

    return () => {
      window.removeEventListener('storage', onStorageUpdate)
    }
  }, [])

  const saveToLocalStorage = (tokens: Record<string, Token>) => {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  }

  const addToken = (token: Token) => {
    const newTokens = { ...tokens, [token.address]: token }
    setTokens(newTokens)
    saveToLocalStorage(newTokens)
  }

  const removeToken = (token: Token) => {
    if (tokens[token.address]) {
      const newTokens = { ...tokens }
      delete newTokens[token.address]

      setTokens(newTokens)
      saveToLocalStorage(newTokens)
    }
  }

  const updateToken = (token: Token) => {
    if (tokens[token.address]) {
      const newTokens = { ...tokens }
      newTokens[token.address] = token

      setTokens(newTokens)
      saveToLocalStorage(newTokens)
    }
  }

  return (
    <TokensContext.Provider value={{
      tokens,
      addToken,
      updateToken,
      removeToken
    }}>
      {children}
    </TokensContext.Provider>
  )
}