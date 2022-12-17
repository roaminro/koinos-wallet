import { Skeleton, Stat, StatLabel, StatNumber, Text } from '@chakra-ui/react'
import { utils } from 'koilib'
import { Token } from '../context/TokensProvider'
import { useTokenBalance } from './BalanceUtils'

interface TokenBalanceProps {
  accountAddress: string,
  token: Token,
}

export function TokenBalance({ accountAddress, token }: TokenBalanceProps) {
  const { balance, isLoading } = useTokenBalance(accountAddress, token.address)

  const parsedBalance = balance ? utils.formatUnits(balance, token.decimals) : '0'

  return (
    <Skeleton isLoaded={!isLoading}>
      <Stat>
        <StatLabel>{token.name}</StatLabel>
        <StatNumber>{parsedBalance} {token.symbol}</StatNumber>
      </Stat>
    </Skeleton>
  )
}