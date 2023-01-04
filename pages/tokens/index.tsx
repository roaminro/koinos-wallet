import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, Heading, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { Token, useTokens } from '../../context/TokensProvider'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { MouseEvent } from 'react'
import NiceModal from '@ebay/nice-modal-react'

export default function Tokens() {
  const toast = useToast()
  const router = useRouter()

  const { tokens, removeToken } = useTokens()

  const handleDeleteClick = (e: MouseEvent, token: Token) => {
    e.stopPropagation()

    NiceModal.show(ConfirmationDialog, {
      body: 'Are you sure you want to delete this token?',
      onAccept: async () => {
        removeToken(token)
        toast({
          title: 'Token successfully removed',
          description: 'The token was successfully removed!',
          status: 'success',
          isClosable: true,
        })
      }
    })
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
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
