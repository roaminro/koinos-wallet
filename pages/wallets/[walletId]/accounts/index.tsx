import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip } from '@chakra-ui/react'
import SimpleSidebar from '../../../../components/Sidebar'
import { useWallets } from '../../../../context/WalletsProvider'
import { useRouter } from 'next/router'
import { useState } from 'react'
import RevealPrivateKeyModal from '../../../../components/RevealPrivateKeyModal'
import { FiEye } from 'react-icons/fi'


export default function Wallets() {
  const router = useRouter()
  const { wallets } = useWallets()

  const [isRevealPrivateKeyModalOpen, setIsRevealPrivateKeyModalOpen] = useState(false)
  const [accountIdToReveal, setAccountIdToReveal] = useState('')

  const { walletId } = router.query

  const revealPrivateKey = (accountId: string) => {
    setAccountIdToReveal(accountId)
    setIsRevealPrivateKeyModalOpen(true)
  }

  return (
    <SimpleSidebar>
      <Center>
        <Card width='100%'>
          <CardHeader>
            <Stack spacing={8} direction='row'>
              <Button colorScheme='blue' onClick={() => router.push(`/wallets/${walletId}/accounts/add`)}>
                Add account
              </Button>
              <Button colorScheme='blue' onClick={() => router.push(`/wallets/${walletId}/accounts/import`)}>
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
                    walletId && Object.keys(wallets[walletId as string].accounts).map((accountId) => {
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
                                <IconButton aria-label='reveal Private Key' icon={<FiEye />} onClick={() => revealPrivateKey(account.public.id)} />
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
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar>
  )
}
