import { Text, Box, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Checkbox, Divider, Heading, Input, Skeleton, Spinner, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { truncateAccount } from '../../util/Utils'

export default function Accounts() {
  interface Message {
    msg: string
  }
  const { wallets, isLoadingWallets } = useWallets()

  const [sender, setSender] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<boolean[][]>([])
  const [messenger, setMessenger] = useState<Messenger<string, Message>>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const msgr = new Messenger<string, Message>(window.opener, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onMessage(({ data }) => {
        setSender(data)
        setIsLoading(false)
      })

      await msgr.connect()
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

  const onClick = () => {
    console.log(messenger)
    // messenger!.sendMessage(text)
  }

  const close = () => {
    self.close()
  }

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
              <Button disabled={isLoadingWallets || isLoading} onClick={close} colorScheme='red'>Cancel</Button>
              <Button disabled={isLoadingWallets || isLoading} onClick={onClick} colorScheme='blue'>Confirm</Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

      </Stack>
    </Box>
  )
}
