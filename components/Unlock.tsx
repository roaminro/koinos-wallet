import { Button, Card, CardBody, CardFooter, CardHeader, Center, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, InputGroup, InputRightAddon, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Skeleton, Stack } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { getSetting, setSetting } from '../util/Settings'
import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY } from '../util/Constants'
import { useWallets } from '../context/WalletsProvider'


export default function Unlock() {
  const router = useRouter()
  const { unlock, isLocked, isVaultSetup } = useWallets()

  const [password, setPassword] = useState('')
  const [unlockTime, setUnlockTime] = useState(1)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    if (!isVaultSetup) {
      router.push({
        pathname: '/create-password',
        query: { returnUrl: router.query.returnUrl }
      })
    } else if (!isLocked) {
      const returnUrl = router.query.returnUrl || '/dashboard'
      router.push(returnUrl as string)
    }

    const defaultUnlockTime = getSetting<number>(DEFAULT_AUTOLOCK_TIME_KEY)

    if (defaultUnlockTime) {
      setUnlockTime(defaultUnlockTime)
    }

    setIsLoading(false)
  }, [isLocked, isVaultSetup, router])


  const onUnlockClick = async () => {
    setIsUnlocking(true)
    try {
      await unlock(password)

      setSetting(DEFAULT_AUTOLOCK_TIME_KEY, unlockTime)

      const unlockTimeDeadline = new Date().getTime() + (unlockTime * 60 * 1000)
      setSetting(AUTOLOCK_DEADLINE_KEY, unlockTimeDeadline)

      const returnUrl = router.query.returnUrl || '/dashboard'
      router.push(returnUrl as string)
    } catch (error) {
      console.error(error)
      setUnlockError(error as string)
    }
    setIsUnlocking(false)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleUnlockTimeChange = (_: string, valueAsNumber: number) => {
    setUnlockTime(valueAsNumber)
  }

  return (
    <Center h='100vh'>
      <Card maxW='sm'>
        <CardHeader>
          <Heading size='md'>
            Unlock app
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Skeleton isLoaded={!isLoading}>
            <Stack
              mt='6'
              spacing='3'
            >
              <FormControl isRequired isInvalid={!!unlockError}>
                <FormLabel>Password</FormLabel>
                <Input type='password' value={password} onChange={handlePasswordChange} />
                <FormHelperText>Enter your password to unlock the application.</FormHelperText>
                {
                  !!unlockError && <FormErrorMessage>{unlockError}</FormErrorMessage>
                }
              </FormControl>
              <FormControl>
                <FormLabel>Auto-lock</FormLabel>
                <InputGroup>
                  <NumberInput step={1} min={1} value={unlockTime} onChange={handleUnlockTimeChange}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon>min.</InputRightAddon>
                </InputGroup>
                <FormHelperText>Auto-lock the application after {unlockTime} minutes of inactivity.</FormHelperText>
              </FormControl>
              <Button
                isLoading={isUnlocking}
                variant='solid'
                colorScheme='green'
                onClick={onUnlockClick}>Unlock</Button>
            </Stack>
          </Skeleton>
        </CardBody>
      </Card>
    </Center>
  )
}