import { Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, Button, useToast, useDisclosure, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ChangeEvent, useRef, useState } from 'react'
import { useWallets } from '../context/WalletsProvider'
import { NETWORKS_KEY, SELECTED_ACCOUNT_KEY, SELECTED_NETWORK_KEY, SETTINGS_KEY, TOKENS_KEY, VAULT_KEY } from '../util/Constants'
import { generateString, saveFile } from '../util/Utils'
import SidebarWithHeader from '../components/Sidebar'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { BackButton } from '../components/BackButton'


export default function Vault() {
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const confirmDialogRef = useRef(null)

  const { isVaultSetup, unlock, tryDecrypt } = useWallets()

  const [password, setPassword] = useState('')
  const [backup, setBackup] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const backupFile = event.target.files[0]
      setBackup(await backupFile.text())
    }
  }


  const generateBackup = async () => {
    setIsLoading(true)

    try {
      const backup: Record<string, string> = {}

      backup[VAULT_KEY] = localStorage.getItem(VAULT_KEY)!

      backup[SELECTED_ACCOUNT_KEY] = localStorage.getItem(SELECTED_ACCOUNT_KEY)!

      backup[NETWORKS_KEY] = localStorage.getItem(NETWORKS_KEY)!

      backup[SELECTED_NETWORK_KEY] = localStorage.getItem(SELECTED_NETWORK_KEY)!

      backup[TOKENS_KEY] = localStorage.getItem(TOKENS_KEY)!

      backup[SETTINGS_KEY] = localStorage.getItem(SETTINGS_KEY)!

      await saveFile(`${generateString(6)}.txt`, new Blob([JSON.stringify(backup)]))
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while generating the backup',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const restoreNewBackup = async () => {
    setIsLoading(true)

    try {
      const parsedBackup: Record<string, string> = JSON.parse(backup!) 

      const encryptedVault = parsedBackup[VAULT_KEY]
      await tryDecrypt(password, encryptedVault!)
      localStorage.setItem(VAULT_KEY, encryptedVault!)

      const selectedAccount = parsedBackup[SELECTED_ACCOUNT_KEY]
      localStorage.setItem(SELECTED_ACCOUNT_KEY, selectedAccount)

      const networks = parsedBackup[NETWORKS_KEY]
      localStorage.setItem(NETWORKS_KEY, networks)

      const selectedNetwork = parsedBackup[SELECTED_NETWORK_KEY]
      localStorage.setItem(SELECTED_NETWORK_KEY, selectedNetwork)

      const tokens = parsedBackup[TOKENS_KEY]
      localStorage.setItem(TOKENS_KEY, tokens)

      const settings = parsedBackup[SETTINGS_KEY]
      localStorage.setItem(SETTINGS_KEY, settings)

      await unlock(password)

      toast({
        title: 'Backup successfully restored',
        description: 'Your backup was successfully restored!',
        status: 'success',
        isClosable: true,
      })

      window.location.replace('/home')
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while restoring the backup',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }

    setIsLoading(false)
  }

  const restoreBackup = async () => {
    if (isVaultSetup) {
      onOpen()
    } else {
      await restoreNewBackup()
    }
  }

  const isPasswordInvalid = password.length < 8

  const isRestoreBackupDisabled = isPasswordInvalid || !backup

  return (
    <SidebarWithHeader>
      <Stack mt='6' spacing='3' align='center'>
        {
          isVaultSetup &&
          <Card maxW='sm' minWidth='350px'>
            <CardHeader>
              <Heading size='md'>
              <BackButton /> Generate backup
              </Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Text marginBottom={2}>The Backup contains all the wallets, accounts, tokens, networks and settings you have setup.</Text>
              <Button
                disabled={!isVaultSetup}
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                width='100%'
                onClick={generateBackup}>
                Generate backup
              </Button>
            </CardBody>
          </Card>
        }
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
              Restore backup
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <FormControl isRequired isInvalid={!backup}>
                <FormLabel>Backup file</FormLabel>
                <Input type='file' onChange={onFileChange} />
                <FormHelperText>Select the vault file to import.</FormHelperText>
                {
                  !backup && <FormErrorMessage>You must select a backup file.</FormErrorMessage>
                }
              </FormControl>
              <FormControl isRequired isInvalid={isPasswordInvalid}>
                <FormLabel>Password</FormLabel>
                <Input type='password' value={password} onChange={handlePasswordChange} />
                <FormHelperText>Enter the vault&apos;s password.</FormHelperText>
                {
                  isPasswordInvalid && <FormErrorMessage>The password must be at least 8 characters.</FormErrorMessage>
                }
              </FormControl>
              <Button
                disabled={isRestoreBackupDisabled}
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                onClick={restoreBackup}>
                Restore backup
              </Button>
            </Stack>
            <ConfirmationDialog
              modalRef={confirmDialogRef}
              body='Restoring a backup vault will destroy the current wallets, accounts, tokens, networks and settings, are you sure you want to restore this backup?'
              onClose={onClose}
              onAccept={async () => {
                await restoreNewBackup()
              }}
              isOpen={isOpen}
            />
          </CardBody>
        </Card>
      </Stack>
    </SidebarWithHeader>
  )
}
