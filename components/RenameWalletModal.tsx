import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, FormErrorMessage } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useWallets } from '../context/WalletsProvider'
import { isAlphanumeric } from '../util/Utils'
import useTranslation from 'next-translate/useTranslation'

interface RenameWalletModalProps {
  walletId: string
}

export default NiceModal.create(({ walletId }: RenameWalletModalProps) => {
  const { t } = useTranslation()
  const modal = useModal()

  const toast = useToast()

  const { wallets, updateWalletName } = useWallets()

  const [walletName, setWalletName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value)
  }

  const onRenameClick = async () => {
    setIsLoading(true)
    try {
      await updateWalletName(walletId, walletName)
      modal.hide()

      toast({
        title: t('renameWalletModal:successToast.title'),
        description: t('renameWalletModal:successToast.description'),
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: t('renameWalletModal:errorToast.title'),
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (walletId && wallets[walletId]) {
      setWalletName(wallets[walletId].name)
    }
  }, [wallets, walletId])

  if (!wallets[walletId]) return <></>

  const isWalletNameInvalid = walletName.length < 1 || !isAlphanumeric(walletName)

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('renameWalletModal:modal.header')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl isRequired isInvalid={isWalletNameInvalid}>
            <FormLabel>{t('renameWalletModal:accountNameField.label')}</FormLabel>
            <Input
              autoFocus={true}
              value={walletName}
              onChange={handleChange}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  onRenameClick()
                }
              }}
            />
            <FormHelperText>{t('renameWalletModal:accountNameField.helper')}</FormHelperText>
            {
              isWalletNameInvalid && <FormErrorMessage>{t('renameWalletModal:accountNameField.error')}</FormErrorMessage>
            }
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={modal.hide}>
            {t('common:close')}
          </Button>
          <Button isDisabled={isWalletNameInvalid} isLoading={isLoading} colorScheme='blue' onClick={onRenameClick}>{t('renameWalletModal:modal.buttonLabel')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
