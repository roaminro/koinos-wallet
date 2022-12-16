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
  tokens: Token[]
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

  const [tokens, setTokens] = useState<Token[]>(appConfig.defaultTokens)

  useEffect(() => {
    const savedTokens = localStorage.getItem(TOKENS_KEY)

    if (savedTokens) {
      setTokens(JSON.parse(savedTokens))
    }
  }, [])

  useEffect(() => {
    if (tokens.length) {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
    }
  }, [tokens])


  const addToken = (token: Token) => {
    setTokens([...tokens, token])
  }

  const removeToken = (token: Token) => {
    setTokens([...tokens.filter((tkn) => tkn.address !== token.address)])
  }

  const updateToken = (token: Token) => {
    for (let index = 0; index < tokens.length; index++) {
      if (tokens[index].address === token.address) {
        tokens[index] = token
        break
      }
    }

    setTokens([...tokens])
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