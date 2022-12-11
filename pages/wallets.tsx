import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip } from '@chakra-ui/react'
import SimpleSidebar from '../components/Sidebar'
import { useWallets } from '../context/WalletsProvider'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import RevealSecretRecoveryPhraseModal from '../components/RevealSecretRecoveryPhraseModal'
import { useState } from 'react'
import { FiClipboard, FiEye, FiUsers } from 'react-icons/fi'


export default function Wallets() {
  const router = useRouter()
  const { wallets } = useWallets()
  const [isRevealSecretRecoveryPhraseModalOpen, setIsRevealSecretRecoveryPhraseModalOpen] = useState(false)
  const [walletNameToReveal, setWalletNameToReveal] = useState('')

  const revealSecretRecoveryPhrase = (walletName: string) => {
    setWalletNameToReveal(walletName)
    setIsRevealSecretRecoveryPhraseModalOpen(true)
  }

  return (
    <SimpleSidebar>
      <Center>
        <Card width='100%'>
          <CardHeader>
            <Stack spacing={8} direction='row'>
              <Button variant='solid' onClick={() => router.push('/create-wallet')}>
                Create wallet
              </Button>
              <Button variant='solid' onClick={() => router.push('/import-wallet')}>
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
                    Object.keys(wallets).map((walletName, walletIndex) => {
                      return (
                        <Tr key={walletIndex}>
                          <Td>
                            <NextLink href={`/accounts/${walletName}`}>{walletName}</NextLink>
                          </Td>
                          <Td>
                            <Stack spacing={4} direction='row'>
                              <Tooltip
                                label="manage accounts"
                                placement="top"
                                hasArrow
                              >
                                <IconButton aria-label='manage accounts' icon={<FiUsers />} onClick={() => router.push(`/accounts/${walletName}`)} />
                              </Tooltip>
                              <Tooltip
                                label="reveal Secret Recovery Phrase"
                                placement="top"
                                hasArrow
                              >
                                <IconButton aria-label='reveal Secret Recovery Phrase' icon={<FiEye />} onClick={() => revealSecretRecoveryPhrase(walletName)} />
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
              walletName={walletNameToReveal}
            />
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar>
  )
}
