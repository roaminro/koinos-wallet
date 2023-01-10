import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, FormErrorMessage } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useWallets } from '../context/WalletsProvider'
import { isAlphanumeric } from '../util/Utils'
import useTranslation from 'next-translate/useTranslation'

interface RenameAccountModalProps {
  walletId: string
  accountId: string
}

export default NiceModal.create(({ walletId, accountId }: RenameAccountModalProps) => {
  const { t } = useTranslation()
  const modal = useModal()

  const toast = useToast()

  const { wallets, updateAccountName } = useWallets()

  const [accountName, setAccountName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value)
  }

  const onRenameClick = async () => {
    setIsLoading(true)
    try {
      await updateAccountName(walletId, accountId, accountName)
      modal.hide()

      toast({
        title: t('renameAccountModal:successToast.title'),
        description: t('renameAccountModal:successToast.description'),
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: t('renameAccountModal:errorToast.title'),
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (walletId && accountId && wallets[walletId] && wallets[walletId].accounts[accountId]) {
      setAccountName(wallets[walletId].accounts[accountId].public.name)
    }
  }, [wallets, walletId, accountId])

  if (!wallets[walletId] || !wallets[walletId].accounts[accountId]) return <></>

  const isAccountNameInvalid = accountName.length < 1 || !isAlphanumeric(accountName)

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('renameAccountModal:modal.header')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl isRequired isInvalid={isAccountNameInvalid}>
            <FormLabel>{t('renameAccountModal:accountNameField.label')}</FormLabel>
            <Input
              autoFocus={true}
              value={accountName}
              onChange={handleChange}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  onRenameClick()
                }
              }}
            />
            <FormHelperText>{t('renameAccountModal:accountNameField.helper')}</FormHelperText>
            {
              isAccountNameInvalid && <FormErrorMessage>{t('renameAccountModal:accountNameField.error')}</FormErrorMessage>
            }
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={modal.hide}>
            {t('common:close')}
          </Button>
          <Button isDisabled={isAccountNameInvalid} isLoading={isLoading} colorScheme='blue' onClick={onRenameClick}>{t('renameAccountModal:modal.buttonLabel')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
