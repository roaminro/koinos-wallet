import { Text, Button, ButtonGroup, Card, CardBody, useColorModeValue, CardHeader, Divider, Heading, Skeleton, Center, useToast, FormControl, FormLabel, Input, Stack, Box, Textarea } from '@chakra-ui/react'
import { ReactElement, useEffect, useState } from 'react'
import { sha256 } from '@noble/hashes/sha256'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { SignMessageArguments } from '../../wallet_connector_handlers/signerHandler'
import { debug } from '../../util/Utils'
import type { NextPageWithLayout } from '../_app'
import { base64EncodeURL } from '../../util/Base64'

const SignMessage: NextPageWithLayout = () => {
  const toast = useToast()

  const { signHash } = useWallets()

  const [requester, setRequester] = useState('')
  const [signerAddress, setSignerAddress] = useState('')
  const [message, setMessage] = useState<string>('')

  const [messenger, setMessenger] = useState<Messenger<SignMessageArguments, string | null>>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)

  useEffect(() => {
    const msgr = new Messenger<SignMessageArguments, string | null>(window.opener, 'sign-message-popup-child', true, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      await msgr.ping('sign-message-popup-parent')
      debug('connected to parent iframe')
      
      const { requester, signerAddress, message } = await msgr.sendRequest('sign-message-popup-parent', null)

      setRequester(requester)
      setSignerAddress(signerAddress)
      setMessage(message)

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
      const signature = await signHash(signerAddress, sha256(message))

      messenger!.sendMessage('sign-message-popup-parent', base64EncodeURL(signature))
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
                  The website &quot;{requester}&quot; is requesting a signature for the following message:
                </Text>
                <Divider marginTop={4} marginBottom={4} />
                <FormControl>
                  <FormLabel>Message</FormLabel>
                  <Textarea value={String(message)} isReadOnly={true} isDisabled={true} />
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

SignMessage.getLayout = function getLayout(page: ReactElement) {
  return (
    page
  )
}

export default SignMessage