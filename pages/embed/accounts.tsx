import { Text, Box, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Checkbox, Divider, Heading, Input, Skeleton, Spinner, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { truncateAccount } from '../../util/Utils'

export interface IAccount {
  name: string
  address: string
  signers: {
    name: string,
    address: string,
  }[]
}

export default function Accounts() {
  const { wallets, isLoadingWallets } = useWallets()

  const [sender, setSender] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<boolean[][]>([])
  const [messenger, setMessenger] = useState<Messenger<string, IAccount[]>>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const msgr = new Messenger<string, IAccount[]>(window.opener, 'accounts-popup-child', true, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onMessage(({ data }) => {
        setSender(data)
        setIsLoading(false)
      })

      await msgr.ping('accounts-popup-parent')
      console.log('connected to parent iframe')
    }

    setupMessenger()


    return () => {
      msgr.removeListener()
      console.log('removed')
    }
  }, [])

  useEffect(() => {
    const accounts: boolean[][] = []

    wallets.forEach((wallet, walletIndex) => {
      accounts.push([])

      wallet.accounts.forEach(() => {
        accounts[walletIndex].push(false)
      })
    })

    setSelectedAccounts([...accounts])
  }, [wallets])

  const updateSelectedAccounts = (walletIndex: number, accountIndex: number, checked: boolean) => {
    selectedAccounts[walletIndex][accountIndex] = checked

    setSelectedAccounts([...selectedAccounts])
  }

  const updateAllSelectedAccounts = (walletIndex: number, checked: boolean) => {
    for (let index = 0; index < selectedAccounts[walletIndex].length; index++) {
      selectedAccounts[walletIndex][index] = checked
    }

    setSelectedAccounts([...selectedAccounts])
  }

  const hasLoadedAccounts = selectedAccounts.length > 0

  const onClickConfirm = () => {
    const accounts: IAccount[] = []

    wallets.forEach((wallet, walletIndex) => {
      wallet.accounts.forEach((account, accountIndex) => {
        if (selectedAccounts[walletIndex][accountIndex]) {
          accounts.push({
            name: '',
            address: account.public.address,
            signers: []
          })
        }
      })
    })

    messenger!.sendMessage('accounts-popup-parent', accounts)
  }

  const close = () => {
    self.close()
  }

  const hasSelectedOneAccount = selectedAccounts.some((wallet) => wallet.some(Boolean)) 

  return (
    <Box padding={{ base: 4, md: 8 }} minHeight='400px'>
      <Stack mt='6' spacing='3'>

        <Card>
          <CardHeader>
            <Heading size='md'>Accounts request</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Skeleton isLoaded={hasLoadedAccounts && !isLoading}>
              <Text>
                Select the accounts you would like to share with the website &quot;{sender}&quot;:
              </Text>
              <Divider marginTop={4} marginBottom={4} />
              {
                hasLoadedAccounts && wallets.map((wallet, walletIndex) => {
                  const allChecked = selectedAccounts[walletIndex].every(Boolean)
                  const isIndeterminate = selectedAccounts[walletIndex].some(Boolean) && !allChecked

                  return (
                    <Box key={walletIndex}>
                      <Checkbox
                        isChecked={allChecked}
                        isIndeterminate={isIndeterminate}
                        onChange={(e) => updateAllSelectedAccounts(walletIndex, e.target.checked)}
                      >
                        <Heading size='sm'>{wallet.name}</Heading>
                      </Checkbox>
                      <Stack pl={6} mt={1} spacing={1}>
                        {
                          wallet.accounts.map((account, accountIndex) => {
                            return (
                              <Checkbox
                                key={`${walletIndex}-${accountIndex}`}
                                isChecked={selectedAccounts[walletIndex][accountIndex]}
                                onChange={(e) => updateSelectedAccounts(walletIndex, accountIndex, e.target.checked)}
                              >
                                {account.public.name} ({truncateAccount(account.public.address)})
                              </Checkbox>
                            )
                          })
                        }
                      </Stack>
                      <Divider marginTop={4} marginBottom={4} />
                    </Box>
                  )
                })
              }
            </Skeleton>
          </CardBody>
          <Divider />
          <CardFooter>
            <ButtonGroup>
              <Button onClick={close} colorScheme='red'>Cancel</Button>
              <Button disabled={isLoadingWallets || isLoading || !hasSelectedOneAccount} onClick={onClickConfirm} colorScheme='blue'>Confirm</Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

      </Stack>
    </Box>
  )
}
