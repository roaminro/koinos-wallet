import { Text, Box, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Checkbox, Divider, Heading, Input, Skeleton, Spinner, Stack, Center } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { truncateAccount } from '../../util/Utils'
import { IAccount } from '../../wallet_connector_handlers/accountsHandler'

export default function Accounts() {
  const { wallets } = useWallets()

  const [sender, setSender] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, Record<string, boolean>>>({})
  const [messenger, setMessenger] = useState<Messenger<string, IAccount[] | null>>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const msgr = new Messenger<string, IAccount[] | null>(window.opener, 'accounts-popup-child', true, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onMessage(({ data }) => {

      })

      await msgr.ping('accounts-popup-parent')
      console.log('connected to parent iframe')
      const sender = await msgr.sendRequest('accounts-popup-parent', null)

      setSender(sender)
      setIsLoading(false)
    }

    setupMessenger()


    return () => {
      msgr.removeListener()
      console.log('removed')
    }
  }, [])

  useEffect(() => {
    const accounts: Record<string, Record<string, boolean>> = {}

    for (const walletName in wallets) {
      const wallet = wallets[walletName]
      accounts[walletName] = {}

      for (const accountName in wallet.accounts) {
        accounts[walletName][accountName] = false
      }
    }

    setSelectedAccounts({ ...accounts })
  }, [wallets])

  const updateSelectedAccounts = (walletName: string, accountName: string, checked: boolean) => {
    selectedAccounts[walletName][accountName] = checked

    setSelectedAccounts({ ...selectedAccounts })
  }

  const updateAllSelectedAccounts = (walletName: string, checked: boolean) => {
    for (const accountName in selectedAccounts[walletName]) {
      selectedAccounts[walletName][accountName] = checked
    }

    setSelectedAccounts({ ...selectedAccounts })
  }

  const hasLoadedAccounts = Object.keys(selectedAccounts).length > 0

  const onClickConfirm = () => {
    const accounts: IAccount[] = []

    for (const walletName in wallets) {
      const wallet = wallets[walletName]

      for (const accountName in wallet.accounts) {
        if (selectedAccounts[walletName][accountName] === true) {
          const account = wallet.accounts[accountName]

          const acct: IAccount = {
            address: account.public.address,
            signers: []
          }

          for (const signerName in account.signers) {
            acct.signers.push({
              address: account.signers[signerName].public.address
            })
          }

          accounts.push(acct)
        }
      }
    }

    messenger!.sendMessage('accounts-popup-parent', accounts)
  }

  const close = () => {
    self.close()
  }

  let hasSelectedOneAccount = false

  for (const walletName in selectedAccounts) {
    const wallet = selectedAccounts[walletName]

    for (const accountName in wallet) {
      if (selectedAccounts[walletName][accountName] === true) {
        hasSelectedOneAccount = true
        break
      }
    }

    if (hasSelectedOneAccount) {
      break
    }
  }

  return (
    <Center>
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
              hasLoadedAccounts && Object.keys(wallets).map((walletName, walletIndex) => {
                const wallet = wallets[walletName]
                let allChecked = true

                let oneAccountIsSelected = false
                for (const accountName in wallet.accounts) {
                  if (selectedAccounts[walletName][accountName] === true) {
                    oneAccountIsSelected = true
                  } else {
                    allChecked = false
                  }
                }

                const isIndeterminate = oneAccountIsSelected && !allChecked

                return (
                  <Box key={walletIndex}>
                    <Checkbox
                      isChecked={allChecked}
                      isIndeterminate={isIndeterminate}
                      onChange={(e) => updateAllSelectedAccounts(walletName, e.target.checked)}
                    >
                      <Heading size='sm'>{wallet.name}</Heading>
                    </Checkbox>
                    <Stack pl={6} mt={1} spacing={1}>
                      {
                        Object.keys(wallet.accounts).map((accountName, accountIndex) => {
                          const account = wallet.accounts[accountName]
                          return (
                            <Checkbox
                              key={`${walletIndex}-${accountIndex}`}
                              isChecked={selectedAccounts[walletName][accountName]}
                              onChange={(e) => updateSelectedAccounts(walletName, accountName, e.target.checked)}
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
          <ButtonGroup spacing='6' width='100%'>
            <Button onClick={close} colorScheme='red'>Cancel</Button>
            <Button width='100%' disabled={isLoading || !hasSelectedOneAccount} onClick={onClickConfirm} colorScheme='green'>Confirm</Button>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </Center>
  )
}
