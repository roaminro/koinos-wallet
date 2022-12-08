import { FiClipboard } from 'react-icons/fi'
import { Box, Button, Card, CardBody, CardHeader, Center, Divider, Flex, Heading, IconButton, Link, Menu, MenuButton, MenuDivider, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Skeleton, Stack, Stat, StatHelpText, StatLabel, StatNumber, Table, TableCaption, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tooltip, Tr, useClipboard, useToast, VStack } from '@chakra-ui/react'
import router from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import SimpleSidebar from '../components/Sidebar'
import { useWallets } from '../context/WalletsProvider'
import { truncateAccount, truncateTransactionId } from '../util/Utils'
import { asFloat, useManaBalance, useTokenBalance } from '../components/BalanceUtils'
import { useNetworks } from '../context/NetworksProvider'
import { useAccountHistory } from '../components/AccountHistoryUtils'
import { ExternalLinkIcon } from '@chakra-ui/icons'

export default function Dashboard() {
  const { wallets, selectedAccount, selectAccount } = useWallets()
  const { selectedNetwork } = useNetworks()
  const { onCopy, setValue: setClipoard } = useClipboard('')
  const toast = useToast()

  const { balance: koinBalance, isLoading: isLoadingKoinBalance } = useTokenBalance(selectedAccount?.account.public.address, selectedNetwork?.tokenAddress)
  const { mana, isLoading: isLoadingManaBalance } = useManaBalance(selectedAccount?.account.public.address)

  const { transactions, isLoading: isLoadingAccountHistory } = useAccountHistory(selectedAccount?.account.public.address)

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
    <SimpleSidebar>
      <Center>
        <Card maxW='sm'>
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
                    Object.keys(wallets).map((walletName, walletIndex) => {
                      const wallet = wallets[walletName]

                      return (
                        <Box key={walletIndex}>
                          <MenuOptionGroup
                            title={wallet.name}
                            type='radio'
                            value={`${selectedAccount?.walletName}-${selectedAccount?.account.public.name}`}
                          >
                            {
                              Object.keys(wallet.accounts).map((accountName, accountIndex) => {
                                const account = wallet.accounts[accountName]
                                return (
                                  <MenuItemOption
                                    key={`${walletIndex}-${accountIndex}`}
                                    onClick={() => selectAccount(walletName, account)}
                                    value={`${walletName}-${accountName}`}
                                  >
                                    {account.public.name} ({truncateAccount(account.public.address)})
                                  </MenuItemOption>
                                )
                              })
                            }
                          </MenuOptionGroup>
                          <Divider />
                        </Box>
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
            </VStack>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <Heading size='sm'>Last 10 transactions</Heading>
              <Skeleton isLoaded={!isLoadingAccountHistory}>

                <TableContainer>
                  <Table variant='simple'>
                    <Tbody>
                      {
                        transactions?.map(historyx =>
                          <Tr key={historyx.trx.transaction.id}>
                            <Td>
                              <Link href={`${selectedNetwork?.explorerUrl}/tx/${historyx.trx.transaction.id}`} isExternal>
                                {truncateTransactionId(historyx.trx.transaction.id!)} <ExternalLinkIcon mx='2px' />
                              </Link>
                            </Td>
                          </Tr>
                        )
                      }
                    </Tbody>
                  </Table>
                </TableContainer>
              </Skeleton>

            </Stack>
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar>
  )
}
