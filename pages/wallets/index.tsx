import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'
import { useWallets } from '../../context/WalletsProvider'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import RevealSecretRecoveryPhraseModal from '../../components/RevealSecretRecoveryPhraseModal'
import { useRef, useState } from 'react'
import { FiEdit, FiEye, FiTrash, FiUsers } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import RenameWalletModal from '../../components/RenameWalletModal'


export default function Wallets() {
  const router = useRouter()
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { wallets, removeWallet } = useWallets()

  const [isRevealSecretRecoveryPhraseModalOpen, setIsRevealSecretRecoveryPhraseModalOpen] = useState(false)
  const [walletIdToReveal, setWalletIdToReveal] = useState('')

  const [walletIdToDelete, setWalletIdToDelete] = useState<string | null>(null)
  const confirmDialogRef = useRef(null)

  const [isRenameWalletModalOpen, setIsRenameWalletModalOpen] = useState(false)
  const [walletIdToRename, setWalletIdToRename] = useState('')

  const handleDeleteClick = (walletId: string) => {
    setWalletIdToDelete(walletId)
    onOpen()
  }

  const revealSecretRecoveryPhrase = (walletId: string) => {
    setWalletIdToReveal(walletId)
    setIsRevealSecretRecoveryPhraseModalOpen(true)
  }

  const renameWallet = (walletId: string) => {
    setWalletIdToRename(walletId)
    setIsRenameWalletModalOpen(true)
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Button colorScheme='blue' onClick={() => router.push('/wallets/create')}>
              Create wallet
            </Button>
            <Button colorScheme='blue' onClick={() => router.push('/wallets/import')}>
              Import wallet
            </Button>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <TableContainer overflowX='auto'>
            <Table variant='striped' colorScheme='blue'>
              <Thead>
                <Tr>
                  <Th>Wallet Name</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  Object.keys(wallets).map((walletId) => {
                    const wallet = wallets[walletId]
                    return (
                      <Tr key={walletId}>
                        <Td cursor='pointer' onClick={() => router.push({ pathname: '/wallets/[walletId]/accounts', query: { walletId } })}>
                          <NextLink href={{
                            pathname: '/wallets/[walletId]/accounts',
                            query: { walletId },
                          }}>{wallet.name}</NextLink>
                        </Td>
                        <Td>
                          <Stack spacing={4} direction='row'>
                            <Tooltip
                              label="manage accounts"
                              placement="top"
                              hasArrow
                            >
                              <IconButton colorScheme='blue' aria-label='manage accounts' icon={<FiUsers />} onClick={() => router.push({ pathname: '/wallets/[walletId]/accounts', query: { walletId } })} />
                            </Tooltip>
                            <Tooltip
                              label="reveal Secret Recovery Phrase"
                              placement="top"
                              hasArrow
                            >
                              <IconButton colorScheme='blue' aria-label='reveal Secret Recovery Phrase' icon={<FiEye />} onClick={() => revealSecretRecoveryPhrase(wallet.id)} />
                            </Tooltip>
                            <Tooltip
                              label="rename wallet"
                              placement="top"
                              hasArrow
                            >
                              <IconButton colorScheme='blue' aria-label='rename wallet' icon={<FiEdit />} onClick={() => renameWallet(wallet.id)} />
                            </Tooltip>
                            <Tooltip
                              label="delete wallet"
                              placement="top"
                              hasArrow
                            >
                              <IconButton
                                aria-label='delete wallet'
                                colorScheme='red'
                                icon={<FiTrash />}
                                onClick={() => handleDeleteClick(walletId)}
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
          <RevealSecretRecoveryPhraseModal
            isOpen={isRevealSecretRecoveryPhraseModalOpen}
            onClose={() => setIsRevealSecretRecoveryPhraseModalOpen(false)}
            walletId={walletIdToReveal}
          />
          <RenameWalletModal
            isOpen={isRenameWalletModalOpen}
            onClose={() => setIsRenameWalletModalOpen(false)}
            walletId={walletIdToRename}
          />
          <ConfirmationDialog
            modalRef={confirmDialogRef}
            onClose={onClose}
            body='Are you sure you want to delete this wallet? Make sure you have a copy of the Secret Recovery Phrase before confirming.'
            onAccept={async () => {
              await removeWallet(walletIdToDelete!)
              setWalletIdToDelete(null)
              toast({
                title: 'Wallet successfully removed',
                description: 'The wallet was successfully removed!',
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
