import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip, Hide } from '@chakra-ui/react'
import SimpleSidebar from '../../components/Sidebar'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import RevealSecretRecoveryPhraseModal from '../../components/RevealSecretRecoveryPhraseModal'
import { FiEdit, FiEye, FiTrash, FiUsers } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { useTokens } from '../../context/TokensProvider'

export default function Tokens() {
  const router = useRouter()
  const { tokens } = useTokens()

  return (
    <SimpleSidebar>
      <Center>
        <Card width='100%'>
          <CardHeader>
            <Stack spacing={8} direction='row'>
              <BackButton />
              <Button colorScheme='blue' onClick={() => router.push('/tokens/add')}>
                Add token
              </Button>
            </Stack>
          </CardHeader>
          <Divider />
          <CardBody>
            <TableContainer overflowX='auto'>
              <Table variant='striped' colorScheme='blue'>
                <Thead>
                  <Tr>
                    <Th>Token Name</Th>
                    <Hide below='md'>
                      <Th>Token Symbol</Th>
                    </Hide>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {
                    tokens.map((token) => {

                      return (
                        <Tr key={token.address}>
                          <Td>
                            {token.name}
                          </Td>
                          <Hide below='md'>
                            <Td>
                              {token.symbol}
                            </Td>
                          </Hide>
                          <Td>
                            <Stack spacing={4} direction='row'>
                              <Tooltip
                                label="edit token"
                                placement="top"
                                hasArrow
                              >
                                <IconButton
                                  aria-label='edit token'
                                  colorScheme='blue'
                                  icon={<FiEdit />}
                                  onClick={() => router.push({ pathname: '/tokens/[tokenAddress]', query: { tokenAddress: token.address } })}
                                />
                              </Tooltip>
                              <Tooltip
                                label="delete token"
                                placement="top"
                                hasArrow
                              >
                                <IconButton
                                  aria-label='delete token'
                                  colorScheme='red'
                                  icon={<FiTrash />}
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
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar >
  )
}
