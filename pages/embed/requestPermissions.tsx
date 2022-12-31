import { useColorModeValue, Text, Box, Button, ButtonGroup, Card, CardBody, CardHeader, Divider, Heading, Skeleton, Stack, Center, List, ListIcon, ListItem } from '@chakra-ui/react'
import { ReactElement, useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { RequestPermissionsArguments, RequestPermissionsResult } from '../../wallet_connector_handlers/permissionsHandler'
import type { NextPageWithLayout } from '../_app'
import { AppPermissions, usePermissions } from '../../context/PermissionsProvider'
import { PERMISSIONS } from '../../util/Permissions'
import getUuidByString from 'uuid-by-string'
import { FiAlertCircle, FiEdit2, FiGlobe, FiUsers } from 'react-icons/fi'
import { IconType } from 'react-icons'

interface DisplayPermission {
  scope: string
  command: string
  description: string
}

const RequestPermissions: NextPageWithLayout = () => {
  const { updateAppPermissions } = usePermissions()

  const [requester, setRequester] = useState('')
  const [requestedPermissions, setRequestedPermissions] = useState<DisplayPermission[]>([])
  const [messenger, setMessenger] = useState<Messenger<RequestPermissionsArguments, RequestPermissionsResult | null>>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const msgr = new Messenger<RequestPermissionsArguments, RequestPermissionsResult | null>(window.opener, 'request-permissions-popup-child', true, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {

      await msgr.ping('request-permissions-popup-parent')
      console.log('connected to parent iframe')

      const { requester, permissions } = await msgr.sendRequest('request-permissions-popup-parent', null)
      setRequester(requester)

      const displayPermissions: DisplayPermission[] = []
      for (const scope in permissions) {
        if (PERMISSIONS[scope]) {
          const commands = permissions[scope]

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

      setRequestedPermissions([...displayPermissions])
      setIsLoading(false)
    }

    setupMessenger()


    return () => {
      msgr.removeListener()
    }
  }, [])

  const onClickApprove = () => {
    const id = getUuidByString(requester)

    const appPermissions: AppPermissions = {
      id,
      url: requester,
      permissions: {}
    }

    for (const perm of requestedPermissions) {
      if (!appPermissions.permissions[perm.scope]) {
        appPermissions.permissions[perm.scope] = []
      }

      if (!appPermissions.permissions[perm.scope].includes(perm.command)) {
        appPermissions.permissions[perm.scope].push(perm.command)
      }
    }

    updateAppPermissions(appPermissions)

    messenger!.sendMessage('request-permissions-popup-parent', {
      permissions: appPermissions.permissions
    })
  }

  const close = () => {
    self.close()
  }

  return (
    <Center>
      <Stack>
        <Card>
          <CardHeader>
            <Heading size='md'>Permissions request</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Skeleton isLoaded={!isLoading}>
              <Text>
                Review the permissions requested by the website &quot;{requester}&quot;:
              </Text>
              <Divider marginTop={4} marginBottom={4} />
              <List spacing={3}>
                {
                  requestedPermissions.map((permission) => {
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
            </Skeleton>
          </CardBody>
        </Card>
        <Box
          style={{ position: 'sticky', bottom: 0, WebkitMaskPosition: 'sticky' }}
          bg={useColorModeValue('gray.100', 'gray.900')}
        >
          <Card>
            <CardBody>
              <ButtonGroup spacing='6' width='100%'>
                <Button onClick={close} colorScheme='red'>Decline</Button>
                <Button width='100%' disabled={isLoading} onClick={onClickApprove} colorScheme='green'>Approve</Button>
              </ButtonGroup>
            </CardBody>
          </Card>
        </Box>
      </Stack>
    </Center>
  )
}

RequestPermissions.getLayout = function getLayout(page: ReactElement) {
  return (
    page
  )
}

export default RequestPermissions
