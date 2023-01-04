import { Card, CardBody, HStack, IconButton, Stack, Tooltip } from '@chakra-ui/react'
import { FiSend } from 'react-icons/fi'
import NiceModal from '@ebay/nice-modal-react'
import { useNetworks } from '../context/NetworksProvider'
import { useTokens } from '../context/TokensProvider'
import { useWallets } from '../context/WalletsProvider'
import { TokenBalance } from './TokenBalance'
import SendTokensModal from '../components/SendTokensModal'

export function TokensPanel() {

  const { selectedAccount } = useWallets()
  const { selectedNetwork } = useNetworks()
  const { tokens } = useTokens()

  const openSendTokensModal = (defaultTokenAddress: string) => {
    NiceModal.show(SendTokensModal, { defaultTokenAddress })
  }

  return (
    <Stack mt='6' spacing='3'>
      {
        selectedAccount && selectedNetwork && Object.keys(tokens).map(tokenAddress => {
          const token = tokens[tokenAddress]
          if (token.chainId === selectedNetwork.chainId) {
            return (
              <Card key={`${token.address}`} variant='outline'>
                <CardBody>
                  <HStack justifyContent='space-between'>
                    <TokenBalance
                      accountAddress={selectedAccount.account.public.address}
                      token={token}
                    />
                    <Tooltip
                      label={`send ${token.symbol} tokens`}
                      placement="bottom"
                      hasArrow
                    >
                      <IconButton bg='brand.blue' aria-label='send tokens' icon={<FiSend />} onClick={() => openSendTokensModal(tokenAddress)} />
                    </Tooltip>
                  </HStack>
                </CardBody>
              </Card>
            )
          }
        })
      }
    </Stack>
  )
}