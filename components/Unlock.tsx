import { Button, Card, CardBody, CardHeader, Center, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, InputGroup, InputRightAddon, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { getSetting, setSetting } from '../util/Settings'
import { AUTOLOCK_DEADLINE_KEY, DEFAULT_AUTOLOCK_TIME_KEY } from '../util/Constants'
import { useWallets } from '../context/WalletsProvider'

export default function Unlock() {
  const router = useRouter()
  const { unlock, isLocked, isVaultSetup } = useWallets()

  const [password, setPassword] = useState('')
  const [unlockTime, setUnlockTime] = useState<number>()
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  useEffect(() => {
    if (!unlockTime) {
      const defaultUnlockTime = getSetting<number>(DEFAULT_AUTOLOCK_TIME_KEY)

      if (defaultUnlockTime) {
        setUnlockTime(defaultUnlockTime)
      } else {
        setUnlockTime(1)
      }
    }
  }, [unlockTime])

  const onUnlockClick = async () => {
    setIsUnlocking(true)
    try {
      await unlock(password)

      setSetting(DEFAULT_AUTOLOCK_TIME_KEY, unlockTime)

      const unlockTimeDeadline = new Date().getTime() + (unlockTime! * 60 * 1000)
      setSetting(AUTOLOCK_DEADLINE_KEY, unlockTimeDeadline)
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

  if (!isVaultSetup) {
    router.push({
      pathname: '/create-password',
      query: { returnUrl: router.query.returnUrl }
    })

    return <></>
  } else if (!isLocked) {
    const returnUrl = router.query.returnUrl || '/home'
    router.push(returnUrl as string)

    return <></>
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
          <Stack
            mt='6'
            spacing='3'
          >
            <FormControl isRequired isInvalid={!!unlockError}>
              <FormLabel>Password</FormLabel>
              <Input
                type='password'
                autoFocus={true}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    onUnlockClick()
                  }
                }}
              />
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
        </CardBody>
      </Card>
    </Center>
  )
}