import { FiClipboard } from 'react-icons/fi'
import { Box, Button, Card, CardBody, CardHeader, Center, Divider, Flex, Heading, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Stack, Tooltip, useClipboard, useToast, VStack } from '@chakra-ui/react'
import router from 'next/router'
import { useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import SimpleSidebar from '../components/Sidebar'
import { useWallets } from '../context/WalletsProvider'
import { truncateAccount } from '../util/Utils'

export default function Dashboard() {
  const { wallets, selectedAccount, selectAccount } = useWallets()
  const { onCopy, setValue } = useClipboard('')
  const toast = useToast()


  useEffect(() => {
    if (selectedAccount) {
      setValue(selectedAccount.account.public.address)
    }
  }, [selectedAccount, setValue])

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
              <Heading as='h3' size='md'>
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
            </VStack>

          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>

            </Stack>
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar>
  )
}
