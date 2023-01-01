import { Card, CardBody, CardHeader, Center, Divider, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiEye, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import { useRef, useState } from 'react'
import { AppPermissions, usePermissions } from '../../context/PermissionsProvider'

export default function Networks() {
  const toast = useToast()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { permissions, removeAppPermissions } = usePermissions()
  const confirmDialogRef = useRef(null)
  const [appPermissionsToDelete, setAppPermissionsToDelete] = useState<AppPermissions | null>(null)

  const handleDeleteClick = (appPermissions: AppPermissions) => {
    setAppPermissionsToDelete(appPermissions)
    onOpen()
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <TableContainer overflowX='auto'>
            <Table variant='striped' colorScheme='blue'>
              <Thead>
                <Tr>
                  <Th>App Url</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  Object.keys(permissions).map((appPermissionsId) => {
                    const appPermissions = permissions[appPermissionsId]
                    return (
                      <Tr key={appPermissions.id}>
                        <Td>
                          {appPermissions.url}
                        </Td>
                        <Td>
                          <Stack spacing={4} direction='row'>
                            <Tooltip
                              label="view app permissions"
                              placement="top"
                              hasArrow
                            >
                              <IconButton
                                aria-label='view app permissions'
                                colorScheme='blue'
                                icon={<FiEye />}
                                onClick={() => router.push({ pathname: '/permissions/[appPermissionsId]', query: { appPermissionsId } })}
                              />
                            </Tooltip>
                            <Tooltip
                              label="revoke app permissions"
                              placement="top"
                              hasArrow
                            >
                              <IconButton
                                aria-label='revoke app permissions'
                                colorScheme='red'
                                icon={<FiTrash />}
                                onClick={() => handleDeleteClick(appPermissions)}
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
            body='Are you sure you want to revoke the permissions for this app?'
            onAccept={() => {
              removeAppPermissions(appPermissionsToDelete!)
              setAppPermissionsToDelete(null)
              toast({
                title: 'Permissions successfully revoked',
                description: 'The permissions were successfully revoked!',
                status: 'success',
                isClosable: true,
              })
            }}
            isOpen={isOpen}
          />
        </CardBody>
      </Card>
    </Center>
  )
}
