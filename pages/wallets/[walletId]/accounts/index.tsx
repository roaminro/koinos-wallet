import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, useDisclosure, Heading, Text, Badge } from '@chakra-ui/react'
import NiceModal from '@ebay/nice-modal-react'
import { useWallets } from '../../../../context/WalletsProvider'
import { useRouter } from 'next/router'
import RevealPrivateKeyModal from '../../../../components/RevealPrivateKeyModal'
import RenameAccountModal from '../../../../components/RenameAccountModal'
import { FiEdit, FiEye, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../../../components/BackButton'
import ConfirmationDialog from '../../../../components/ConfirmationDialog'

export default function Wallets() {
  const router = useRouter()
  const toast = useToast()

  const { wallets, isLocked, removeAccount } = useWallets()

  const { walletId } = router.query

  const handleDeleteClick = (accountId: string) => {
    NiceModal.show(ConfirmationDialog, {
      body: 'Are you sure you want to delete this account? Make sure you have a copy of the Private Key before confirming.',
      onAccept: async () => {
        await removeAccount(walletId as string, accountId)
        toast({
          title: 'Account successfully removed',
          description: 'The account was successfully removed!',
          status: 'success',
          isClosable: true,
        })
      }
    })
  }

  const revealPrivateKey = (accountId: string) => {
    NiceModal.show(RevealPrivateKeyModal, { walletId, accountId })
  }

  const renameAccount = (accountId: string) => {
    NiceModal.show(RenameAccountModal, { walletId, accountId })
  }

  if (isLocked || !walletId) return <></>

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>Accounts for {wallets[walletId as string].name}</Heading>
          </Stack>
          <br />
          <Stack spacing={8} direction='row'>
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
          <Stack>
            {
              walletId && wallets[walletId as string] && Object.keys(wallets[walletId as string].accounts).map((accountId) => {
                const account = wallets[walletId as string].accounts[accountId]
                return (
                  <Card key={accountId} variant='outline'>
                    <CardBody>
                      <Stack>
                        <Heading size='md'>
                          {account.public.name}
                          {' '}
                          <Badge colorScheme='blue'>{account.public.keyPath}</Badge>
                        </Heading>

                        <Text>{account.public.address}</Text>
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
                      </Stack>
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
