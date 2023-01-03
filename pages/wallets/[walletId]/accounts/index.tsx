import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'
import { useWallets } from '../../../../context/WalletsProvider'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import RevealPrivateKeyModal from '../../../../components/RevealPrivateKeyModal'
import { FiEdit, FiEye, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../../../components/BackButton'
import { ConfirmationDialog } from '../../../../components/ConfirmationDialog'
import RenameAccountModal from '../../../../components/RenameAccountModal'


export default function Wallets() {
  const router = useRouter()
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { wallets, isLocked, removeAccount } = useWallets()

  const [isRevealPrivateKeyModalOpen, setIsRevealPrivateKeyModalOpen] = useState(false)
  const [accountIdToReveal, setAccountIdToReveal] = useState('')
  
  const [accountIdToDelete, setAccountIdToDelete] = useState<string | null>(null)
  const confirmDialogRef = useRef(null)

  const [isRenameAccountModalOpen, setIsRenameAccountModalOpen] = useState(false)
  const [accountIdToRename, setAccountIdToRename] = useState('')

  const { walletId } = router.query

  const handleDeleteClick = (accountId: string) => {
    setAccountIdToDelete(accountId)
    onOpen()
  }

  const revealPrivateKey = (accountId: string) => {
    setAccountIdToReveal(accountId)
    setIsRevealPrivateKeyModalOpen(true)
  }

  const renameAccount = (accountId: string) => {
    setAccountIdToRename(accountId)
    setIsRenameAccountModalOpen(true)
  }

  if (isLocked) return <></>

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Button colorScheme='blue' onClick={() => router.push({ pathname: '/wallets/[walletId]/accounts/add', query: { walletId } })}>
              Add account
            </Button>
            <Button colorScheme='blue' onClick={() => router.push({ pathname: '/wallets/[walletId]/accounts/import', query: { walletId } })}>
              Import account
            </Button>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <TableContainer overflowX='auto'>
            <Table variant='striped' colorScheme='blue'>
              <Thead>
                <Tr>
                  <Th>Account Name</Th>
                  <Th>Address</Th>
                  <Th>Key Path</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  walletId && wallets[walletId as string] && Object.keys(wallets[walletId as string].accounts).map((accountId) => {
                    const account = wallets[walletId as string].accounts[accountId]
                    return (
                      <Tr key={accountId}>
                        <Td>
                          {account.public.name}
                        </Td>
                        <Td>
                          {account.public.address}
                        </Td>
                        <Td>
                          {account.public.keyPath}
                        </Td>
                        <Td>
                          <Stack spacing={4} direction='row'>
                            <Tooltip
                              label="reveal Private Key"
                              placement="top"
                              hasArrow
                            >
                              <IconButton colorScheme='blue' aria-label='reveal Private Key' icon={<FiEye />} onClick={() => revealPrivateKey(account.public.id)} />
                            </Tooltip>
                            <Tooltip
                              label="rename account"
                              placement="top"
                              hasArrow
                            >
                              <IconButton colorScheme='blue' aria-label='rename account' icon={<FiEdit />} onClick={() => renameAccount(accountId)} />
                            </Tooltip>
                            <Tooltip
                              label="delete account"
                              placement="top"
                              hasArrow
                            >
                              <IconButton
                                aria-label='delete account'
                                colorScheme='red'
                                icon={<FiTrash />}
                                onClick={() => handleDeleteClick(accountId)}
                              />
                            </Tooltip>
                          </Stack>
                        </Td>
                      </Tr>
                    )
                  })
                }
              </Tbody>
            </Table>
          </TableContainer>
          <RevealPrivateKeyModal
            isOpen={isRevealPrivateKeyModalOpen}
            onClose={() => setIsRevealPrivateKeyModalOpen(false)}
            walletId={walletId as string}
            accountId={accountIdToReveal}
          />
          <RenameAccountModal
            isOpen={isRenameAccountModalOpen}
            onClose={() => setIsRenameAccountModalOpen(false)}
            walletId={walletId as string}
            accountId={accountIdToRename}
          />
          <ConfirmationDialog
            modalRef={confirmDialogRef}
            onClose={onClose}
            body='Are you sure you want to delete this account? Make sure you have a copy of the Private Key before confirming.'
            onAccept={async () => {
              await removeAccount(walletId as string, accountIdToDelete!)
              setAccountIdToDelete(null)
              toast({
                title: 'Account successfully removed',
                description: 'The account was successfully removed!',
                status: 'success',
                isClosable: true,
              })
            }}
            isOpen={isOpen}
          />
        </CardBody>
      </Card>
    </Center>
  )
}
