import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, IconButton, Textarea, Tooltip, useClipboard } from '@chakra-ui/react'
import { ChangeEvent, useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { useWallets } from '../context/WalletsProvider'

interface RevealSecretRecoveryPhraseModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string
}

export default function RevealSecretRecoveryPhraseModal({ isOpen, onClose, walletId }: RevealSecretRecoveryPhraseModalProps) {
  const toast = useToast()
  const { onCopy, setValue } = useClipboard('')

  const { getWalletSecretRecoveryPhrase } = useWallets()

  const [password, setPassword] = useState('')
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const onCopySecretRecoveryPhrase = () => {
    onCopy()

    toast({
      title: 'Secret Recovery Phrase successfully copied',
      description: 'The Secret Recovery Phrase was successfully copied!',
      status: 'success',
      isClosable: true,
    })
  }

  const onRevealClick = async () => {
    setIsLoading(true)
    try {
      const secret = await getWalletSecretRecoveryPhrase(walletId!, password)
      setSecretRecoveryPhrase(secret)
      setValue(secret)

    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while revealing the secret recovery phrase',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsLoading(false)
  }

  const onCloseClick = () => {
    setPassword('')
    setSecretRecoveryPhrase('')
    onClose()
  }

  const isPasswordInvalid = password.length < 8

  return (
    <Modal isOpen={isOpen} onClose={onCloseClick}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reveal Secret Recovery Phrase</ModalHeader>
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
            <FormLabel>
              Secret Recovery Phrase {' '}
              <Tooltip
                label="copy Secret Recovery Phrase to clipboard"
                placement="bottom"
                hasArrow
              >
                <IconButton aria-label='Copy address' icon={<FiClipboard />} onClick={onCopySecretRecoveryPhrase} />
              </Tooltip>
            </FormLabel>
            <Textarea value={secretRecoveryPhrase} readOnly={true} />
            <FormHelperText>The &quot;Secret Recovery Phrase&quot; is the &quot;Master Key&quot; that allows you to recover your accounts. You MUST keep it in a safe place as losing it will result in a loss of the funds.</FormHelperText>
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
