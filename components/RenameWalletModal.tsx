import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, FormErrorMessage } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useWallets } from '../context/WalletsProvider'
import { isAlphanumeric } from '../util/Utils'

interface RenameWalletModalProps {
  walletId: string
}

export default NiceModal.create(({ walletId }: RenameWalletModalProps) => {
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
        title: 'Wallet successfully renamed',
        description: 'The Wallet was successfully renamed!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while renamimg the wallet',
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
        <ModalHeader>Rename wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl isRequired isInvalid={isWalletNameInvalid}>
            <FormLabel>New name</FormLabel>
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
            <FormHelperText>Enter the new name for the wallet.</FormHelperText>
            {
              isWalletNameInvalid && <FormErrorMessage>The wallet name must be at least 1 character and can only composed of the following characters (_-[0-9][a-z][A-Z]).</FormErrorMessage>
            }
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={modal.hide}>
            Close
          </Button>
          <Button isDisabled={isWalletNameInvalid} isLoading={isLoading} colorScheme='blue' onClick={onRenameClick}>Rename</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
