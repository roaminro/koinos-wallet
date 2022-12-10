import { Link, Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast } from '@chakra-ui/react'
import SimpleSidebar from '../components/Sidebar'
import { useWallets } from '../context/WalletsProvider'
import { truncateTransactionId } from '../util/Utils'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import RevealSecretRecoveryPhraseModal from '../components/RevealSecretRecoveryPhraseModal'
import { useState } from 'react'


export default function Wallets() {
  const router = useRouter()
  const { wallets } = useWallets()
  const toast = useToast()
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
            <TableContainer>
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
                              <Button variant='solid' onClick={() => router.push(`/accounts/${walletName}`)}>
                                Manage accounts
                              </Button>
                              <Button variant='solid' onClick={() => revealSecretRecoveryPhrase(walletName)}>
                                Reveal Secret Recovery Phrase
                              </Button>
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
