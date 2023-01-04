import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, Heading, Text, HStack, VStack } from '@chakra-ui/react'
import { useWallets } from '../../context/WalletsProvider'
import { useRouter } from 'next/router'
import RevealSecretRecoveryPhraseModal from '../../components/RevealSecretRecoveryPhraseModal'
import { MouseEvent } from 'react'
import { FiEdit, FiEye, FiTrash, FiUsers } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import RenameWalletModal from '../../components/RenameWalletModal'
import NiceModal from '@ebay/nice-modal-react'
import ConfirmationDialog from '../../components/ConfirmationDialog'

export default function Wallets() {
  const toast = useToast()
  const router = useRouter()

  const { wallets, removeWallet } = useWallets()

  const handleDeleteClick = (e: MouseEvent, walletId: string) => {
    e.stopPropagation()

    NiceModal.show(ConfirmationDialog, {
      body: 'Are you sure you want to delete this wallet? Make sure you have a copy of the Secret Recovery Phrase before confirming.',
      onAccept: async () => {
        await removeWallet(walletId)
        toast({
          title: 'Wallet successfully removed',
          description: 'The wallet was successfully removed!',
          status: 'success',
          isClosable: true,
        })
      }
    })
  }

  const revealSecretRecoveryPhrase = (e: MouseEvent, walletId: string) => {
    e.stopPropagation()
    NiceModal.show(RevealSecretRecoveryPhraseModal, { walletId })
  }

  const renameWallet = (e: MouseEvent, walletId: string) => {
    e.stopPropagation()
    NiceModal.show(RenameWalletModal, { walletId })
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
                  <Card key={walletId} variant='outline'>
                    <CardBody cursor='pointer'
                      onClick={() => router.push({ pathname: '/wallets/[walletId]/accounts', query: { walletId } })}
                    >
                      <HStack justifyContent='space-between' flexWrap='wrap'>
                        <Stack marginBottom='10px'>
                          <Heading
                            size='md'>
                            {wallet.name}
                          </Heading>

                          <Text>{Object.keys(wallet.accounts).length} accounts</Text>
                        </Stack>

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
                      </HStack>
                    </CardBody>
                  </Card>
                )
              })
            }
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
