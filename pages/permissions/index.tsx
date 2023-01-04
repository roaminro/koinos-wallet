import { Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, Heading } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiEye, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { MouseEvent } from 'react'
import { AppPermissions, usePermissions } from '../../context/PermissionsProvider'
import NiceModal from '@ebay/nice-modal-react'

export default function Networks() {
  const toast = useToast()
  const router = useRouter()

  const { permissions, removeAppPermissions } = usePermissions()

  const handleDeleteClick = (e: MouseEvent, appPermissions: AppPermissions) => {
    e.stopPropagation()
    
    NiceModal.show(ConfirmationDialog, {
      body: 'Are you sure you want to revoke the permissions for this app?',
      onAccept: async () => {
        removeAppPermissions(appPermissions)
        toast({
          title: 'Permissions successfully revoked',
          description: 'The permissions were successfully revoked!',
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
            <Heading size='md'>
              Apps permissions
            </Heading>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack>
            {
              Object.keys(permissions).map((appPermissionsId) => {
                const appPermissions = permissions[appPermissionsId]
                return (
                  <Card key={appPermissions.id} variant='outline'>
                    <CardBody
                      cursor='pointer'
                      onClick={() => router.push({ pathname: '/permissions/[appPermissionsId]', query: { appPermissionsId } })}
                    >
                      <Stack>
                        <Heading size='md'>
                          {appPermissions.url}
                        </Heading>
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
                              onClick={(e) => handleDeleteClick(e, appPermissions)}
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
    </Center >
  )
}
