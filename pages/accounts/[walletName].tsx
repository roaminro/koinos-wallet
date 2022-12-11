import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip } from '@chakra-ui/react'
import SimpleSidebar from '../../components/Sidebar'
import { useWallets } from '../../context/WalletsProvider'
import { useRouter } from 'next/router'
import { useState } from 'react'
import RevealPrivateKeyModal from '../../components/RevealPrivateKeyModal'
import { FiEye } from 'react-icons/fi'


export default function Wallets() {
  const router = useRouter()
  const { wallets } = useWallets()

  const [isRevealPrivateKeyModalOpen, setIsRevealPrivateKeyModalOpen] = useState(false)
  const [accountNameToReveal, setAccountNameToReveal] = useState('')

  const { walletName } = router.query

  const revealPrivateKey = (accountName: string) => {
    setAccountNameToReveal(accountName)
    setIsRevealPrivateKeyModalOpen(true)
  }

  return (
    <SimpleSidebar>
      <Center>
        <Card width='100%'>
          <CardHeader>
            <Stack spacing={8} direction='row'>
              <Button variant='solid' onClick={() => router.push(`/add-account/${walletName}`)}>
                Add account
              </Button>
              <Button variant='solid' onClick={() => router.push(`/import-account/${walletName}`)}>
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
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {
                    walletName && Object.keys(wallets[walletName as string].accounts).map((accountName, accountIndex) => {
                      return (
                        <Tr key={accountIndex}>
                          <Td>
                            {accountName}
                          </Td>
                          <Td>
                            <Stack spacing={4} direction='row'>
                              <Tooltip
                                label="reveal Private Key"
                                placement="top"
                                hasArrow
                              >
                                <IconButton aria-label='reveal Private Key' icon={<FiEye />} onClick={() => revealPrivateKey(accountName)} />
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
              walletName={walletName as string}
              accountName={accountNameToReveal}
            />
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar>
  )
}
