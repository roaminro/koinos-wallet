import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, useDisclosure, Heading, Text } from '@chakra-ui/react'
import { useWallets } from '../../context/WalletsProvider'
import { useRouter } from 'next/router'
import RevealSecretRecoveryPhraseModal from '../../components/RevealSecretRecoveryPhraseModal'
import { useRef, useState, MouseEvent } from 'react'
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

  const handleDeleteClick = (e: MouseEvent, walletId: string) => {
    e.stopPropagation()
    setWalletIdToDelete(walletId)
    onOpen()
  }

  const revealSecretRecoveryPhrase = (e: MouseEvent, walletId: string) => {
    e.stopPropagation()
    setWalletIdToReveal(walletId)
    setIsRevealSecretRecoveryPhraseModalOpen(true)
  }

  const renameWallet = (e: MouseEvent, walletId: string) => {
    e.stopPropagation()
    setWalletIdToRename(walletId)
    setIsRenameWalletModalOpen(true)
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>Wallets</Heading>
          </Stack>
          <br />
          <Stack spacing={8} direction='row'>
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
          <Stack>
            {
              Object.keys(wallets).map((walletId) => {
                const wallet = wallets[walletId]
                return (
                  <Card key={walletId}>
                    <CardBody cursor='pointer'
                      onClick={() => router.push({ pathname: '/wallets/[walletId]/accounts', query: { walletId } })}
                    >
                      <Stack>
                        <Heading
                          size='md'>
                          {wallet.name}
                        </Heading>

                        <Text>{Object.keys(wallet.accounts).length} accounts</Text>

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
                            <IconButton colorScheme='blue' aria-label='reveal Secret Recovery Phrase' icon={<FiEye />} onClick={(e) => revealSecretRecoveryPhrase(e, wallet.id)} />
                          </Tooltip>
                          <Tooltip
                            label="rename wallet"
                            placement="top"
                            hasArrow
                          >
                            <IconButton colorScheme='blue' aria-label='rename wallet' icon={<FiEdit />} onClick={(e) => renameWallet(e, wallet.id)} />
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
                              onClick={(e) => handleDeleteClick(e, walletId)}
                            />
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                )
              })
            }
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
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
