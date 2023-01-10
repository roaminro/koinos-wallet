import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, IconButton, Textarea, Tooltip, useClipboard, InputGroup, InputRightElement } from '@chakra-ui/react'
import { ChangeEvent, useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { FiClipboard } from 'react-icons/fi'
import { useWallets } from '../context/WalletsProvider'
import useTranslation from 'next-translate/useTranslation'

interface RevealPrivateKeyModalProps {
  walletId: string
  accountId: string
}

export default NiceModal.create(({ walletId, accountId }: RevealPrivateKeyModalProps) => {
  const { t } = useTranslation()
  const modal = useModal()

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
      title: t('revealPrivateKeyModal:copyToast.title'),
      description: t('revealPrivateKeyModal:copyToast.description'),
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
    setPrivateKey('')
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
            <FormLabel>{t('revealPrivateKeyModal:privateKeyField.label')}</FormLabel>
            <InputGroup>
              <Input value={privateKey} />
              <InputRightElement>
                <Tooltip
                  label={t('revealPrivateKeyModal:privateKeyField.tooltip')}
                  placement="bottom"
                  hasArrow
                >
                  <IconButton aria-label={t('revealPrivateKeyModal:privateKeyField.tooltip')} icon={<FiClipboard />} onClick={onCopyPrivateKey} />
                </Tooltip></InputRightElement>
            </InputGroup>
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
