import {
  FiAlertCircle,
  FiEdit2,
  FiGlobe,
  FiUsers,
} from 'react-icons/fi'
import { Card, CardHeader, Heading, Divider, CardBody, Button, useToast, Center, List, ListIcon, ListItem, useDisclosure, Stack } from '@chakra-ui/react'
import { useRef, useState } from 'react'

import { BackButton } from '../../../components/BackButton'
import { useRouter } from 'next/router'
import { AppPermissions, usePermissions } from '../../../context/PermissionsProvider'
import { PERMISSIONS } from '../../../util/Permissions'
import { IconType } from 'react-icons'
import { ConfirmationDialog } from '../../../components/ConfirmationDialog'

interface DisplayPermission {
  scope: string
  command: string
  description: string
}

export default function Edit() {
  const toast = useToast()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { permissions, removeAppPermissions } = usePermissions()

  const { appPermissionsId } = router.query

  const confirmDialogRef = useRef(null)
  const [appPermissionsToDelete, setAppPermissionsToDelete] = useState<AppPermissions | null>(null)


  const handleDeleteClick = (appPermissions: AppPermissions) => {
    setAppPermissionsToDelete(appPermissions)
    onOpen()
  }

  if (!appPermissionsId || !permissions[appPermissionsId as string]) return <></>

  const appPermissions = permissions[appPermissionsId as string]

  const displayPermissions: DisplayPermission[] = []
  for (const scope in appPermissions.permissions) {
    if (PERMISSIONS[scope]) {
      const commands = appPermissions.permissions[scope]

      for (const command of commands) {
        if (PERMISSIONS[scope][command]) {
          displayPermissions.push({
            scope,
            command,
            description: PERMISSIONS[scope][command]
          })
        }
      }
    }
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>
              Permissions for {appPermissions.url}
            </Heading>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <List spacing={3}>
            {
              displayPermissions.map((permission) => {
                let icon: IconType = FiAlertCircle

                switch (permission.scope) {
                  case 'accounts':
                    icon = FiUsers
                    break
                  case 'signer':
                    icon = FiEdit2
                    break
                  case 'provider':
                    icon = FiGlobe
                    break
                  default:
                    break
                }

                return (
                  <ListItem key={`${permission.scope}-${permission.command}`}>
                    <ListIcon as={icon} color='green.500' />
                    {permission.description}
                  </ListItem>
                )
              })
            }
          </List>
          <br />
          <Button
            width='100%'
            colorScheme='red'
            onClick={() => handleDeleteClick(appPermissions)}
          >
            Revoke Permissions
          </Button>
        </CardBody>
      </Card>
      <ConfirmationDialog
        modalRef={confirmDialogRef}
        onClose={onClose}
        body='Are you sure you want to revoke the permissions for this app?'
        onAccept={() => {
          removeAppPermissions(appPermissionsToDelete!)
          setAppPermissionsToDelete(null)
          router.push('/permissions')
          toast({
            title: 'Permissions successfully revoked',
            description: 'The permissions were successfully revoked!',
            status: 'success',
            isClosable: true,
          })
        }}
        isOpen={isOpen}
      />
    </Center>
  )
}
