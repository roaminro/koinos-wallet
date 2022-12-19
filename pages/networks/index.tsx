import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useClipboard, useToast, Skeleton, IconButton, Tooltip, Hide, useDisclosure } from '@chakra-ui/react'
import SimpleSidebar from '../../components/Sidebar'
import { useRouter } from 'next/router'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import { useRef, useState } from 'react'
import { Network, useNetworks } from '../../context/NetworksProvider'

export default function Networks() {
  const toast = useToast()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { networks, removeNetwork } = useNetworks()
  const confirmDialogRef = useRef(null)
  const [networkToDelete, setNetworkToDelete] = useState<Network | null>(null)

  const handleDeleteClick = (network: Network) => {
    setNetworkToDelete(network)
    onOpen()
  }

  return (
    <SimpleSidebar>
      <Center>
        <Card width='100%'>
          <CardHeader>
            <Stack spacing={8} direction='row'>
              <BackButton />
              <Button colorScheme='blue' onClick={() => router.push('/networks/add')}>
                Add network
              </Button>
            </Stack>
          </CardHeader>
          <Divider />
          <CardBody>
            <TableContainer overflowX='auto'>
              <Table variant='striped' colorScheme='blue'>
                <Thead>
                  <Tr>
                    <Th>Network Name</Th>
                    <Hide below='md'>
                      <Th>RPC Url</Th>
                    </Hide>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {
                    Object.keys(networks).map((networkId) => {
                      const network = networks[networkId]
                      return (
                        <Tr key={network.id}>
                          <Td>
                            {network.name}
                          </Td>
                          <Hide below='md'>
                            <Td>
                              {network.rpcUrl}
                            </Td>
                          </Hide>
                          <Td>
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
                                  onClick={() => handleDeleteClick(network)}
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
              body='Are you sure you want to delete this network?'
              onAccept={() => {
                removeNetwork(networkToDelete!)
                setNetworkToDelete(null)
                toast({
                  title: 'Network successfully removed',
                  description: 'The network was successfully removed!',
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
