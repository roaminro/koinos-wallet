import { Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, InputRightAddon, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Skeleton, Stack } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { usePasswordManager } from '../hooks/PasswordManager'
import { getSetting, setSetting } from '../util/Settings'

const DEFAULT_AUTOLOCK_TIME_KEY = 'DEFAULT_AUTOLOCK_TIME'
const AUTOLOCK_DEADLINE_KEY = 'AUTOLOCK_DEADLINE'

interface UnlockProps {
  onUnlock: () => void;
}

export default function Unlock({ onUnlock }: UnlockProps) {
  const { isLoadingPasswordManager, checkPassword } = usePasswordManager()

  const [password, setPassword] = useState('')
  const [unlockTime, setUnlockTime] = useState(0)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const checkAutoLock = () => {
    const autolockDeadlineStr = getSetting<number>(AUTOLOCK_DEADLINE_KEY)

    if (autolockDeadlineStr) {
      const now = new Date()
      const autolockDeadline = new Date(autolockDeadlineStr)

      if (now >= autolockDeadline) {
        setSetting(AUTOLOCK_DEADLINE_KEY, 0)
      } else {
        return true
      }
    }

    return false
  }


  useEffect(() => {
    if (checkAutoLock()) {
      onUnlock()
    }

    const defaultUnlockTime = getSetting<number>(DEFAULT_AUTOLOCK_TIME_KEY)

    if (defaultUnlockTime) {
      setUnlockTime(defaultUnlockTime)
    }

    setIsLoading(false)
  }, [onUnlock])

  useEffect(() => {
    const interval = setInterval(() => {
      checkAutoLock()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const onUnlockClick = async () => {
    setIsUnlocking(true)
    try {
      await checkPassword(password)

      setSetting(DEFAULT_AUTOLOCK_TIME_KEY, unlockTime)

      if (unlockTime > 0) {
        const unlockTimeDeadline = new Date().getTime() + (unlockTime * 60 * 1000)
        setSetting(AUTOLOCK_DEADLINE_KEY, unlockTimeDeadline)
      }

      onUnlock()
    } catch (error) {
      console.error(error)
      setUnlockError((error as Error).message)
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
    <Skeleton isLoaded={!isLoading && !isLoadingPasswordManager}>
      <Stack
        borderWidth="thin"
        borderColor="inherit"
        borderRadius="md"
        padding="4"
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
          <FormLabel>Keep unlocked</FormLabel>
          <InputGroup>
            <NumberInput step={1} min={0} value={unlockTime} onChange={handleUnlockTimeChange}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon>min.</InputRightAddon>
          </InputGroup>
          <FormHelperText>Keep application unlocked for {unlockTime} minutes.</FormHelperText>
        </FormControl>
        <Button isLoading={isUnlocking} onClick={onUnlockClick}>Unlock</Button>
      </Stack>
    </Skeleton>
  )
}