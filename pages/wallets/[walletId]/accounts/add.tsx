import { useToast, Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, Button, Center } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState, ChangeEvent } from 'react'
import { BackButton } from '../../../../components/BackButton'
import SidebarWithHeader from '../../../../components/Sidebar'
import { useWallets } from '../../../../context/WalletsProvider'
import { isAlphanumeric } from '../../../../util/Utils'

export default function Add() {
  const router = useRouter()
  const toast = useToast()

  const { addAccount, wallets, isLocked } = useWallets()

  const { walletId } = router.query

  const [accountName, setAccountName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAccountNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value)
  }

  const addAccountClick = async () => {
    setIsLoading(true)

    try {
      if (!walletId) {
        throw new Error('missing walletId')
      }

      await addAccount(walletId as string, accountName)

      router.push('/home')

      toast({
        title: 'Account successfully added',
        description: 'Your account was successfully added!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while adding the account',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isAccountNameInvalid = accountName.length < 1 || !isAlphanumeric(accountName)

  if (isLocked) return <></>

  return (
    <SidebarWithHeader>
      <Center>
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
            <BackButton /> Add account to wallet &quot;{walletId && wallets[walletId as string].name}&quot;
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <FormControl isRequired isInvalid={isAccountNameInvalid}>
                <FormLabel>Account Name</FormLabel>
                <Input value={accountName} onChange={handleAccountNameChange} />
                <FormHelperText>The account name is an easy way for you to identify an account.</FormHelperText>
                {
                  isAccountNameInvalid && <FormErrorMessage>The account name must be at least 1 character and can only composed of the following characters (_-[0-9][a-z][A-Z]).</FormErrorMessage>
                }
              </FormControl>
              <Button
                disabled={isAccountNameInvalid || !walletId}
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                onClick={addAccountClick}>
                Add Account
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Center>
    </SidebarWithHeader>
  )
}