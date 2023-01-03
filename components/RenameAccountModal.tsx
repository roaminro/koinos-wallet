import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormHelperText, FormLabel, Input, useToast, FormErrorMessage } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useWallets } from '../context/WalletsProvider'
import { isAlphanumeric } from '../util/Utils'

interface RenameAccountModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string
  accountId: string
}

export default function RenameAccountModal({ isOpen, onClose, walletId, accountId }: RenameAccountModalProps) {
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
      onClose()

      toast({
        title: 'Account successfully renamed',
        description: 'The Account was successfully renamed!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while renamimg the account',
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rename wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl isRequired isInvalid={isAccountNameInvalid}>
            <FormLabel>New name</FormLabel>
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
            <FormHelperText>Enter the new name for the account.</FormHelperText>
            {
              isAccountNameInvalid && <FormErrorMessage>The account name must be at least 1 character and can only composed of the following characters (_-[0-9][a-z][A-Z]).</FormErrorMessage>
            }
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button isDisabled={isAccountNameInvalid} isLoading={isLoading} colorScheme='blue' onClick={onRenameClick}>Rename</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
