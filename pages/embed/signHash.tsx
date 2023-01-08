import { Text, Button, ButtonGroup, Card, CardBody, useColorModeValue, CardHeader, Divider, Heading, Skeleton, Center, useToast, FormControl, FormLabel, Input, Stack, Box, Textarea } from '@chakra-ui/react'
import { ReactElement, useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { SignHashArguments } from '../../wallet_connector_handlers/signerHandler'
import { debug } from '../../util/Utils'
import type { NextPageWithLayout } from '../_app'
import { base64DecodeURL, base64EncodeURL } from '../../util/Base64'
import { utils } from 'koilib'
import { SIGN_HASH_CHILD_ID, SIGN_HASH_PARENT_ID } from '../../util/Constants'

const SignHash: NextPageWithLayout = () => {
  const toast = useToast()

  const { signHash } = useWallets()

  const [requester, setRequester] = useState('')
  const [signerAddress, setSignerAddress] = useState('')
  const [hash, setHash] = useState<Uint8Array>()

  const [messenger, setMessenger] = useState<Messenger<SignHashArguments, string | null>>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)

  useEffect(() => {
    const msgr = new Messenger<SignHashArguments, string | null>(window.opener, SIGN_HASH_CHILD_ID, true, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      await msgr.ping(SIGN_HASH_PARENT_ID)
      debug('connected to parent iframe')
      
      const { requester, signerAddress, hash } = await msgr.sendRequest(SIGN_HASH_PARENT_ID, null)

      setRequester(requester)
      setSignerAddress(signerAddress)
      setHash(base64DecodeURL(hash))

      setIsLoading(false)
    }

    setupMessenger()

    return () => {
      msgr.removeListener()
    }
  }, [])


  const onClickConfirm = async () => {
    setIsSigning(true)
    try {
      const signature = await signHash(signerAddress, hash!)

      messenger!.sendMessage(SIGN_HASH_PARENT_ID, base64EncodeURL(signature))
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while processing the signature',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsSigning(false)
  }

  const close = () => {
    self.close()
  }

  const hexHash = hash ? utils.toHexString(hash) : ''

  return (
    <Center>
      <Stack>
        <Card>
          <CardHeader>
            <Heading size='md'>Message signature request</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Skeleton isLoaded={!isLoading}>
              <Stack>
                <Text>
                  The website &quot;{requester}&quot; is requesting a signature for the following hash:
                </Text>
                <Divider marginTop={4} marginBottom={4} />
                <FormControl>
                  <FormLabel>Hash hexadecimal</FormLabel>
                  <Input value={hexHash} isReadOnly={true} isDisabled={true} />
                </FormControl>
                <FormControl>
                  <FormLabel>Hash bytes</FormLabel>
                  <Textarea value={hash?.toString()} isReadOnly={true} isDisabled={true} />
                </FormControl>
              </Stack>
            </Skeleton>
          </CardBody>
        </Card>
        <Box
          style={{ position: 'sticky', bottom: 0, WebkitMaskPosition: 'sticky' }}
          bg={useColorModeValue('gray.100', 'gray.900')}
        >
          <Card>
            <CardBody>
              <ButtonGroup spacing='6' width='100%'>
                <Button onClick={close} colorScheme='red'>Cancel</Button>
                <Button width='100%' disabled={isLoading} isLoading={isSigning} onClick={onClickConfirm} colorScheme='green'>
                  Sign
                </Button>
              </ButtonGroup>
            </CardBody>
          </Card>
        </Box>
      </Stack>
    </Center>
  )
}

SignHash.getLayout = function getLayout(page: ReactElement) {
  return (
    page
  )
}

export default SignHash