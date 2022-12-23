import { FiClipboard, FiSend } from 'react-icons/fi'
import { Box, Button, Card, CardBody, CardHeader, Center, Divider, Heading, IconButton, Menu, MenuButton, MenuItemOption, MenuList, MenuOptionGroup, Skeleton, Stat, StatHelpText, StatNumber, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useClipboard, useToast, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useWallets } from '../context/WalletsProvider'
import { truncateAccount } from '../util/Utils'
import { asFloat, useManaBalance, useTokenBalance } from '../components/BalanceUtils'
import { useNetworks } from '../context/NetworksProvider'
import SendTokensModal from '../components/SendTokensModal'
import { AccountHistory } from '../components/AccountHistory'
import { TokensPanel } from '../components/TokensPanel'

export default function Home() {
  const { wallets, selectedAccount, selectAccount } = useWallets()
  const { selectedNetwork } = useNetworks()
  const { onCopy, setValue: setClipoard } = useClipboard('')
  const toast = useToast()

  const { balance: koinBalance, isLoading: isLoadingKoinBalance } = useTokenBalance(selectedAccount?.account?.public.address, selectedNetwork?.tokenAddress)
  const { mana, isLoading: isLoadingManaBalance } = useManaBalance(selectedAccount?.account?.public.address)

  const [isSendTokensModalOpen, setIsSendTokensModalOpen] = useState(false)

  useEffect(() => {
    if (!selectedAccount) {
      const walletIds = Object.keys(wallets)

      if (walletIds.length) {
        const walletId = walletIds[0]
        const accountIds = Object.keys(wallets[walletId].accounts)
        const account = wallets[walletId].accounts[accountIds[0]]
        selectAccount(walletId, wallets[walletId].name, account)
      }
    }
  }, [wallets, selectedAccount, selectAccount])


  useEffect(() => {
    if (selectedAccount) {
      setClipoard(selectedAccount.account.public.address)
    }
  }, [selectedAccount, setClipoard])

  const onCopyAddress = () => {
    onCopy()

    toast({
      title: 'Address successfully copied',
      description: 'The account address was successfully copied!',
      status: 'success',
      isClosable: true,
    })
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <VStack alignItems='center'>
            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                {
                  selectedAccount ?
                    `${selectedAccount.walletName} - ${selectedAccount.account.public.name}`
                    :
                    'Select an account...'
                }
              </MenuButton>
              <MenuList>
                {
                  Object.keys(wallets).map((walletId) => {
                    const wallet = wallets[walletId]

                    return (
                      <MenuOptionGroup
                        key={walletId}
                        title={wallet.name}
                        type='radio'
                        value={`${selectedAccount?.walletId}-${selectedAccount?.account.public.id}`}
                      >
                        {
                          Object.keys(wallet.accounts).map((accountId) => {
                            const account = wallet.accounts[accountId]
                            return (
                              <MenuItemOption
                                key={`${wallet.id}-${accountId}`}
                                onClick={() => selectAccount(wallet.id, wallet.name, account)}
                                value={`${wallet.id}-${accountId}`}
                              >
                                {account.public.name} ({truncateAccount(account.public.address)})
                              </MenuItemOption>
                            )
                          })
                        }
                      </MenuOptionGroup>
                    )
                  })
                }
              </MenuList>
            </Menu>
            <Heading as='h3' size='sm'>
              {
                selectedAccount && (
                  <>
                    <Tooltip
                      label={selectedAccount.account.public.address}
                      placement="bottom"
                      hasArrow
                    >
                      {truncateAccount(selectedAccount.account.public.address)}
                    </Tooltip>
                    {' '}
                    <Tooltip
                      label="copy address to clipboard"
                      placement="bottom"
                      hasArrow
                    >
                      <IconButton aria-label='copy address' icon={<FiClipboard />} onClick={onCopyAddress} />
                    </Tooltip>
                  </>
                )
              }
            </Heading>
            {
              <Stat>
                <Skeleton isLoaded={!isLoadingKoinBalance}>
                  <StatNumber>{`${asFloat(koinBalance!, selectedNetwork?.tokenDecimals!)} ${selectedNetwork?.tokenSymbol}`}</StatNumber>
                </Skeleton>
                <Skeleton isLoaded={!isLoadingManaBalance}>
                  <StatHelpText>{asFloat(mana!, selectedNetwork?.tokenDecimals!)} mana</StatHelpText>
                </Skeleton>

              </Stat>
            }
            <Tooltip
              label="send tokens"
              placement="bottom"
              hasArrow
            >
              <IconButton bg='brand.blue' aria-label='send tokens' icon={<FiSend />} onClick={() => setIsSendTokensModalOpen(true)} />
            </Tooltip>
          </VStack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs isLazy>
            <TabList>
              <Tab>Tokens</Tab>
              <Tab>Activity</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <TokensPanel />
              </TabPanel>
              <TabPanel>
                <AccountHistory />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
      <SendTokensModal
        isOpen={isSendTokensModalOpen}
        onClose={() => { setIsSendTokensModalOpen(false) }}
      />
    </Center>
  )
}
