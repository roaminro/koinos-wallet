import { Text, Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, Heading, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { MouseEvent } from 'react'
import { Network, useNetworks } from '../../context/NetworksProvider'
import NiceModal from '@ebay/nice-modal-react'

export default function Networks() {
  const toast = useToast()
  const router = useRouter()

  const { networks, removeNetwork } = useNetworks()

  const handleDeleteClick = (e: MouseEvent, network: Network) => {
    e.stopPropagation()

    NiceModal.show(ConfirmationDialog, {
      body: 'Are you sure you want to delete this network?',
      onAccept: async () => {
        removeNetwork(network)
        toast({
          title: 'Network successfully removed',
          description: 'The network was successfully removed!',
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
            <Heading size='md'>Networks</Heading>
          </Stack>
          <br />
          <Stack spacing={8} direction='row'>
            <Button colorScheme='blue' onClick={() => router.push('/networks/add')}>
              Add network
            </Button>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack>
            {
              Object.keys(networks).map((networkId) => {
                const network = networks[networkId]
                return (
                  <Card key={network.id} variant='outline'>
                    <CardBody
                      cursor='pointer'
                      onClick={() => router.push({ pathname: '/networks/[networkId]', query: { networkId } })}
                    >
                      <HStack justifyContent='space-between' flexWrap='wrap'>
                        <Stack marginBottom='10px'>
                          <Heading size='md'>
                            {network.name}
                          </Heading>
                          <Text>
                            {network.rpcUrl}
                          </Text>
                        </Stack>
                        <Stack spacing={4} direction='row'>
                          <Tooltip
                            label="edit network"
                            placement="top"
                            hasArrow
                          >
                            <IconButton
                              aria-label='edit network'
                              colorScheme='blue'
                              icon={<FiEdit />}
                              onClick={() => router.push({ pathname: '/networks/[networkId]', query: { networkId } })}
                            />
                          </Tooltip>
                          <Tooltip
                            label="delete network"
                            placement="top"
                            hasArrow
                          >
                            <IconButton
                              aria-label='delete network'
                              colorScheme='red'
                              icon={<FiTrash />}
                              onClick={(e) => handleDeleteClick(e, network)}
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
