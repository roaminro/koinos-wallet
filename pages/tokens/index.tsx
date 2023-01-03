import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, useDisclosure, Heading, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { Token, useTokens } from '../../context/TokensProvider'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import { useRef, useState, MouseEvent } from 'react'

export default function Tokens() {
  const toast = useToast()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { tokens, removeToken } = useTokens()
  const confirmDialogRef = useRef(null)
  const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null)

  const handleDeleteClick = (e: MouseEvent, token: Token) => {
    e.stopPropagation()
    setTokenToDelete(token)
    onOpen()
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>Tokens</Heading>
          </Stack>
          <br />
          <Stack spacing={8} direction='row'>
            <Button colorScheme='blue' onClick={() => router.push('/tokens/add')}>
              Add token
            </Button>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack>
            {
              Object.keys(tokens).map((tokenAddress) => {
                const token = tokens[tokenAddress]
                return (
                  <Card key={token.address} variant='outline'>
                    <CardBody
                      cursor='pointer'
                      onClick={() => router.push({ pathname: '/tokens/[tokenAddress]', query: { tokenAddress: token.address } })}
                    >
                      <Stack>
                        <Heading size='md'>
                          {token.name}
                        </Heading>
                        <Text>
                          {token.symbol}
                        </Text>
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
                              onClick={(e) => handleDeleteClick(e, token)}
                            />
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                )
              })
            }
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
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
