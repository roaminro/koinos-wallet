import { Box, useToast, Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, CardFooter, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState, ChangeEvent } from 'react'
import Nav from '../../components/Nav'
import { useWallets } from '../../context/WalletsProvider'
import { isAlphanumeric } from '../../util/Utils'

export default function AddAccount() {
  const router = useRouter()
  const toast = useToast()

  const { addAccount, wallets, isLocked } = useWallets()

  const { walletIndex } = router.query

  const [accountName, setAccountName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  let walletIndexNum: number

  const handleAccountNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value)
  }

  const addAccountClick = async () => {
    setIsLoading(true)

    try {
      if (!walletIndex) {
        throw new Error('missing walletIndex')
      }

      await addAccount(walletIndexNum, accountName)

      router.push('/dashboard')

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
        description: (error as Error).message,
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isAccountNameInvalid = accountName.length < 1 || !isAlphanumeric(accountName)

  walletIndexNum = walletIndex ? parseInt(walletIndex as string) : 0

  const walletName = !isLocked ? wallets[walletIndexNum].name : ''

  return (
    <>
      <Nav />
      <Box padding={{ base: 4, md: 8 }} margin='auto' maxWidth='1024px'>
        <Stack mt='6' spacing='3' align='center'>
          <Card maxW='sm'>
            <CardHeader>
              <Heading size='md'>
                Add account to wallet &quot;{walletName}&quot;
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
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button
                disabled={isAccountNameInvalid || !walletIndex}
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                onClick={addAccountClick}>
                Add Account
              </Button>
            </CardFooter>
          </Card>
        </Stack>
      </Box>
    </>
  )
}