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
  addToken: (token: Token) => {},
  updateToken: (token: Token) => {},
  removeToken: (token: Token) => {}
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
    }
  }, [])

  useEffect(() => {
    if (Object.keys(tokens).length) {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
    }
  }, [tokens])


  const addToken = (token: Token) => {
    setTokens({ ...tokens, [token.address]: token })
  }

  const removeToken = (token: Token) => {
    if (tokens[token.address]) {
      delete tokens[token.address]
      setTokens({ ...tokens })
    }
  }

  const updateToken = (token: Token) => {
    if (tokens[token.address]) {
      tokens[token.address] = token
      setTokens({ ...tokens })
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