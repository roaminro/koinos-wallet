import { Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, Button, useToast, useDisclosure } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ChangeEvent, useRef, useState } from 'react'
import { useWallets } from '../context/WalletsProvider'
import { VAULT_KEY } from '../util/Constants'
import { generateString, saveFile } from '../util/Utils'
import SidebarWithHeader from '../components/Sidebar'
import { ConfirmationDialog } from '../components/ConfirmationDialog'


export default function Vault() {
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const confirmDialogRef = useRef(null)


  const { isVaultSetup, unlock, tryDecrypt } = useWallets()

  const [password, setPassword] = useState('')
  const [encryptedVault, setEncryptedVault] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const vaultFile = event.target.files[0]
      setEncryptedVault(await vaultFile.text())
    }
  }


  const exportVault = async () => {
    setIsLoading(true)

    try {
      await saveFile(`${generateString(6)}.txt`, new Blob([localStorage.getItem(VAULT_KEY)!]))
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while exporting the vault',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const importNewVault = async () => {
    setIsLoading(true)

    try {
      await tryDecrypt(password, encryptedVault!)
      localStorage.setItem(VAULT_KEY, encryptedVault!)
      await unlock(password)

      router.push('/dashboard')
      toast({
        title: 'Vault successfully import',
        description: 'Your vault was successfully imported!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while importing the vault',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }

    setIsLoading(false)
  }

  const importVault = async () => {
    if (isVaultSetup) {
      onOpen()
    } else {
      await importNewVault()
    }
  }

  const isPasswordInvalid = password.length < 8

  const isImportVaultDisabled = isPasswordInvalid || !encryptedVault

  return (
    <SidebarWithHeader>
      <Stack mt='6' spacing='3' align='center'>
        {
          isVaultSetup &&
          <Card maxW='sm' minWidth='350px'>
            <CardHeader>
              <Heading size='md'>
                Export vault
              </Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Button
                disabled={!isVaultSetup}
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                width='100%'
                onClick={exportVault}>
                Export Vault
              </Button>
            </CardBody>
          </Card>
        }
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
              Import vault
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <FormControl isRequired isInvalid={!encryptedVault}>
                <FormLabel>Vault file</FormLabel>
                <Input type='file' onChange={onFileChange} />
                <FormHelperText>Select the vault file to import.</FormHelperText>
                {
                  !encryptedVault && <FormErrorMessage>You must select a vault file.</FormErrorMessage>
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
                disabled={isImportVaultDisabled}
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                onClick={importVault}>
                Import Vault
              </Button>
            </Stack>
            <ConfirmationDialog
              modalRef={confirmDialogRef}
              body='Importing a new vault will destroy the current the vault setup, are you sure you want to import this new vault?'
              onClose={onClose}
              onAccept={async () => {
                await importNewVault()
              }}
              isOpen={isOpen}
            />
          </CardBody>
        </Card>
      </Stack>
    </SidebarWithHeader>
  )
}
