import { Stack } from '@chakra-ui/react'
import { useNetworks } from '../context/NetworksProvider'
import { useTokens } from '../context/TokensProvider'
import { useWallets } from '../context/WalletsProvider'
import { TokenBalance } from './TokenBalance'


export function TokensPanel() {

  const { selectedAccount } = useWallets()
  const { selectedNetwork } = useNetworks()
  const { tokens } = useTokens()


  return (
    <Stack mt='6' spacing='3'>
      {
        selectedAccount && selectedNetwork && Object.keys(tokens).map(tokenAddress => {
          const token = tokens[tokenAddress]
          if (token.chainId === selectedNetwork.chainId) {
            return (
              <TokenBalance
                key={`${token.address}`}
                accountAddress={selectedAccount.account.public.address}
                token={token}
              />
            )
          }
        })
      }
    </Stack>
  )
}