import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, IconButton, Textarea, Tooltip, useClipboard } from '@chakra-ui/react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import useTranslation from 'next-translate/useTranslation'
import { ChangeEvent, useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { useWallets } from '../context/WalletsProvider'

interface RevealSecretRecoveryPhraseModalProps {
  walletId: string
}

export default NiceModal.create(({ walletId }: RevealSecretRecoveryPhraseModalProps) => {
  const { t } = useTranslation()
  const modal = useModal()

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
      title: t('revealPrivateKeyModal:copyToast.title'),
      description: t('revealPrivateKeyModal:copyToast.description'),
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
        title: t('revealPrivateKeyModal:errorToast.title'),
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
    modal.hide()
  }

  const isPasswordInvalid = password.length < 8

  return (
    <Modal isOpen={modal.visible} onClose={onCloseClick}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('revealPrivateKeyModal:modal.header')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl isRequired>
            <FormLabel>{t('common:password')}</FormLabel>
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
            <FormHelperText>{t('revealPrivateKeyModal:passwordField.helper')}</FormHelperText>
          </FormControl>

          <FormControl isReadOnly={true}>
            <FormLabel>
            {t('revealPrivateKeyModal:secretRecoveryPhraseField.label')} {' '}
              <Tooltip
                label={t('revealPrivateKeyModal:secretRecoveryPhraseField.tooltip')}
                placement="bottom"
                hasArrow
              >
                <IconButton aria-label={t('revealPrivateKeyModal:secretRecoveryPhraseField.tooltip')} icon={<FiClipboard />} onClick={onCopySecretRecoveryPhrase} />
              </Tooltip>
            </FormLabel>
            <Textarea value={secretRecoveryPhrase} readOnly={true} />
            <FormHelperText>{t('revealPrivateKeyModal:secretRecoveryPhraseField.helper')}</FormHelperText>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onCloseClick}>
          {t('common:close')}
          </Button>
          <Button isDisabled={isPasswordInvalid} isLoading={isLoading} colorScheme='blue' onClick={onRevealClick}>{t('revealPrivateKeyModal:modal.buttonLabel')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
