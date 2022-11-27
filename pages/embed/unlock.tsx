import { ChangeEvent, useEffect, useState } from 'react'
import { Box, Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { Messenger } from '../../util/Messenger'
import { Account } from '../../util/HDKoinos'
import { loadWalletAccounts } from '../../util/Storage'

export default function Unlock() {
  const toast = useToast()

  const [sender, setSender] = useState('')
  const [password, setPassword] = useState('')
  const [messenger, setMessenger] = useState<Messenger<string, Account[]>>()
  const [isLoading, setIsLoading] = useState(true)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')


  useEffect(() => {
    const msgr = new Messenger<string, Account[]>(window.opener, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onMessage(({ data }) => {
        setSender(data)
        setIsLoading(false)
      })
      
      await msgr.connect()
      console.log('connected to wallet-connector')
    }

    setupMessenger()


    return () => {
      msgr.removeListener()
    }
  }, [])

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const onUnlockClick = async () => {
    setIsUnlocking(true)
    setUnlockError('')
    try {
      const accounts = await loadWalletAccounts(password)
      console.log(accounts)
      messenger!.sendMessage(accounts)
    } catch (error) {
      console.error(error)
      setUnlockError((error as Error).message)
    } finally {
      setIsUnlocking(false)
    }
  }

  const close = () => {
    self.close()
  }

  if (isLoading) return <Spinner />

  return (
    <Box>
      Sender: {sender}
      <FormControl isRequired isInvalid={!!unlockError}>
        <FormLabel>Password</FormLabel>
        <Input type='password' value={password} onChange={handlePasswordChange}/>
        <FormHelperText>Enter the password to unlock the wallet.</FormHelperText>
        {
          !!unlockError && <FormErrorMessage>{unlockError}</FormErrorMessage>
        }
      </FormControl>
      <Button disabled={isUnlocking} onClick={onUnlockClick}>Unlock</Button>
      <Button disabled={isUnlocking} onClick={close}>Cancel</Button>
    </Box>
  )
}
