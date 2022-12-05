import { Box, Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, Textarea, Checkbox, Tag, TagLeftIcon, TagLabel, CardFooter, Button, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ChangeEvent, useState } from 'react'
import { useWallets } from '../context/WalletsProvider'

export default function CreatePassword() {
  const router = useRouter()
  const toast = useToast()

  const { unlock } = useWallets()

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isConfirmingPassword, setIsConfirmingPassword] = useState(false)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handlePasswordConfirmationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirmation(e.target.value)
  }

  const setupPassword = async () => {
    setIsConfirmingPassword(true)

    try {
      await unlock(password)

      setPassword('')
      setPasswordConfirmation('')

      const returnUrl = router.query.returnUrl || '/welcome'
      router.push(returnUrl as string)

      toast({
        title: 'Password successfully setup',
        description: 'Your password was successfully setup!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while setting up the password',
        description: (error as Error).message,
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsConfirmingPassword(false)
    }
  }

  const isPasswordInvalid = password.length < 8
  const isPasswordConfirmationInvalid = passwordConfirmation !== password

  const isConfirmPasswordDisabled = isPasswordInvalid || isPasswordConfirmationInvalid

  return (
    <Box padding={{ base: 4, md: 8 }} margin='auto' maxWidth='1024px'>
      <Stack mt='6' spacing='3' align='center'>
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
              Setup password
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <FormControl isRequired isInvalid={isPasswordInvalid}>
                <FormLabel>Password</FormLabel>
                <Input type='password' value={password} onChange={handlePasswordChange} />
                <FormHelperText>The first time you use this application you need to setup a password that will be used to encrypt your sensitive information in your browser&quot;s secured local storage.</FormHelperText>
                {
                  isPasswordInvalid && <FormErrorMessage>The password must be at least 8 characters.</FormErrorMessage>
                }
              </FormControl>
              <FormControl isRequired isInvalid={isPasswordConfirmationInvalid}>
                <FormLabel>Password Confirmation</FormLabel>
                <Input type='password' value={passwordConfirmation} onChange={handlePasswordConfirmationChange} />
                <FormHelperText>Confirm the password you entered in the Password field.</FormHelperText>
                {
                  isPasswordConfirmationInvalid && <FormErrorMessage>The password confirmation is different than the password.</FormErrorMessage>
                }
              </FormControl>
            </Stack>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              disabled={isConfirmPasswordDisabled}
              isLoading={isConfirmingPassword}
              variant='solid'
              colorScheme='green'
              onClick={setupPassword}>
              Confirm Password
            </Button>
          </CardFooter>
        </Card>
      </Stack>
    </Box>
  )
}
