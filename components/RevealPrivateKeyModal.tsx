import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, IconButton, Textarea, Tooltip, useClipboard, InputGroup, InputRightElement } from '@chakra-ui/react'
import { ChangeEvent, useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { useWallets } from '../context/WalletsProvider'

interface RevealPrivateKeyModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string
  accountId: string
}

export default function RevealPrivateKeyModal({ isOpen, onClose, walletId, accountId }: RevealPrivateKeyModalProps) {
  const toast = useToast()
  const { onCopy, setValue } = useClipboard('')

  const { getAccountPrivateKey } = useWallets()

  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const onCopyPrivateKey = () => {
    onCopy()

    toast({
      title: 'Private Key successfully copied',
      description: 'The Private key was successfully copied!',
      status: 'success',
      isClosable: true,
    })
  }

  const onRevealClick = async () => {
    setIsLoading(true)
    try {
      const privateKey = await getAccountPrivateKey(walletId!, accountId!, password)
      setPrivateKey(privateKey)
      setValue(privateKey)

    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while revealing the private key',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsLoading(false)
  }

  const onCloseClick = () => {
    setPassword('')
    setPrivateKey('')
    onClose()
  }

  const isPasswordInvalid = password.length < 8

  return (
    <Modal isOpen={isOpen} onClose={onCloseClick}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reveal Private Key</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type='password'
              autoFocus={true}
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  onRevealClick()
                }
              }}
            />
            <FormHelperText>Enter your password to reveal the Secret Recovery Phrase.</FormHelperText>
          </FormControl>

          <FormControl isReadOnly={true}>
            <FormLabel>Private Key</FormLabel>
            <InputGroup>
              <Input value={privateKey} />
              <InputRightElement>
                <Tooltip
                  label="copy Private Key to clipboard"
                  placement="bottom"
                  hasArrow
                >
                  <IconButton aria-label='Copy private key' icon={<FiClipboard />} onClick={onCopyPrivateKey} />
                </Tooltip></InputRightElement>
            </InputGroup>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onCloseClick}>
            Close
          </Button>
          <Button isDisabled={isPasswordInvalid} isLoading={isLoading} colorScheme='blue' onClick={onRevealClick}>Reveal</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
