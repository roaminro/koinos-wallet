import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip, Hide, useDisclosure } from '@chakra-ui/react'
import SimpleSidebar from '../../components/Sidebar'
import { useRouter } from 'next/router'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { Token, useTokens } from '../../context/TokensProvider'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import { useRef, useState } from 'react'

export default function Tokens() {
  const toast = useToast()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { tokens, removeToken } = useTokens()
  const confirmDialogRef = useRef(null)
  const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null)

  const handleDeleteClick = (token: Token) => {
    setTokenToDelete(token)
    onOpen()
  }

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
                                  onClick={() => handleDeleteClick(token)}
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
            <ConfirmationDialog
              modalRef={confirmDialogRef}
              onClose={onClose}
              body='Are you sure you want to delete this token?'
              onAccept={() => {
                removeToken(tokenToDelete!)
                setTokenToDelete(null)
                toast({
                  title: 'Token successfully removed',
                  description: 'The token was successfully removed!',
                  status: 'success',
                  isClosable: true,
                })
              }}
              isOpen={isOpen}
            />
          </CardBody>
        </Card>
      </Center>
    </SimpleSidebar >
  )
}
