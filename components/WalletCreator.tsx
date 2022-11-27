import { useToast, Textarea, Box, Button, Card, CardBody, CardFooter, Divider, Heading, Stack, FormControl, FormHelperText, FormLabel, Input, FormErrorMessage, Checkbox, Tag, TagCloseButton, TagLabel, TagLeftIcon, Skeleton } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState } from 'react'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'

import { HDKoinos } from '../util/HDKoinos'
import Nav from '../components/Nav'
import { encrypt } from '../util/Encryption'
import { isAlphanumeric, equalArray } from '../util/Utils'
import { useWallets } from '../context/WalletsProvider'

interface WalletCreateProps {
  importingSecretPhrase?: boolean
}

export default function WalletCreator({ importingSecretPhrase = false }: WalletCreateProps) {
  const router = useRouter()
  const toast = useToast()
  const { wallets, addWallet, isLoadingWallets } = useWallets()

  const [walletName, setWalletName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [secretPhrase, setSecretPhrase] = useState('')
  const [isSecretPhraseSaved, setIsSecretPhraseSaved] = useState(false)
  const [secretPhraseConfirmation, setSecretPhraseConfirmation] = useState<string[]>([])
  const [secretPhraseWords, setSecretPhraseWords] = useState<string[]>([])
  const [originalSecretPhraseWords, setOriginalSecretPhraseWords] = useState<string[]>([])
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [existingWallets, setExistingWallets] = useState<string[]>([])

  useEffect(() => {
    if (!importingSecretPhrase) {
      const secretPhrase = HDKoinos.randomMnemonic()
      setSecretPhrase(secretPhrase)
      setOriginalSecretPhraseWords(secretPhrase.split(' '))
      setSecretPhraseWords(secretPhrase.split(' ').sort(() => Math.random() - 0.5))
      setSecretPhraseConfirmation([])

      for (const wallet of wallets) {
        setExistingWallets(prev => [...prev, wallet.name])
      }
    }

  }, [wallets, importingSecretPhrase])

  const handleSecretPhraseChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSecretPhrase(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handlePasswordConfirmationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirmation(e.target.value)
  }

  const handleWalletNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value)
  }

  const handleAccountNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value)
  }

  const handleSavedSecretPhraseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsSecretPhraseSaved(e.target.checked)
    setSecretPhraseWords(secretPhrase.split(' ').sort(() => Math.random() - 0.5))
    setSecretPhraseConfirmation([])
  }

  const onAvailableSecretWordClick = (wordIndex: number) => {
    setSecretPhraseConfirmation([...secretPhraseConfirmation, secretPhraseWords[wordIndex]])
    setSecretPhraseWords(secretPhraseWords.filter((_, index) => index !== wordIndex))
  }

  const onSecretWordConfirmationClick = (wordIndex: number) => {
    setSecretPhraseWords([...secretPhraseWords, secretPhraseConfirmation[wordIndex]])
    setSecretPhraseConfirmation(secretPhraseConfirmation.filter((_, index) => index !== wordIndex))
  }

  const createWallet = async () => {
    setIsCreatingWallet(true)

    try {
      const hdKoinos = new HDKoinos(secretPhrase)
      const account = hdKoinos.deriveKeyAccount(0, accountName)
      account.private.privateKey = await encrypt(account.private.privateKey, password)

      addWallet({
        name: walletName,
        encryptedSecretPhrase: await encrypt(secretPhrase, password),
        accounts: [account]
      })

      toast({
        title: 'Wallet successfully created',
        description: 'Your wallet was successfully created!',
        status: 'success',
        isClosable: true,
      })

      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while creating the wallet',
        description: (error as Error).message,
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsCreatingWallet(false)
    }
  }

  const isWalletNameInvalid = walletName.length < 1 || !isAlphanumeric(walletName) || existingWallets.includes(walletName)
  const isAccountNameInvalid = accountName.length < 1 || !isAlphanumeric(accountName)
  const isPasswordInvalid = password.length < 8
  const isPasswordConfirmationInvalid = passwordConfirmation !== password
  const isSecretPhraseConfirmed = importingSecretPhrase ? secretPhrase.split(' ').length === 12 : equalArray(originalSecretPhraseWords, secretPhraseConfirmation)
  let isCreateButtonDisabled = true
  if (importingSecretPhrase) {
    isCreateButtonDisabled =
      isWalletNameInvalid
      || isAccountNameInvalid
      || isPasswordInvalid
      || isPasswordConfirmationInvalid
      || !isSecretPhraseConfirmed
  } else {
    isCreateButtonDisabled =
      isWalletNameInvalid
      || isAccountNameInvalid
      || isPasswordInvalid
      || isPasswordConfirmationInvalid
      || !isSecretPhraseSaved
      || !isSecretPhraseConfirmed
  }

  return (
    <>
      <Nav />
      <Box padding={{ base: 4, md: 8 }} margin='auto' maxWidth='1024px'>
        <Stack mt='6' spacing='3' align='center'>
          <Skeleton isLoaded={!isLoadingWallets}>
            <Card maxW='sm'>
              <CardBody>
                <Stack mt='6' spacing='3'>
                  <Heading size='md'>
                    {
                      importingSecretPhrase ?
                        'Import a wallet'
                        : 'Create a new wallet'
                    }
                  </Heading>
                  <FormControl isRequired isInvalid={isWalletNameInvalid}>
                    <FormLabel>Wallet Name</FormLabel>
                    <Input value={walletName} onChange={handleWalletNameChange} />
                    <FormHelperText>The wallet name is an easy way for you to identify a wallet.</FormHelperText>
                    {
                      isWalletNameInvalid && <FormErrorMessage>The wallet name must be unique, at least 1 character and can only composed of the following characters (_-[0-9][a-z][A-Z]).</FormErrorMessage>
                    }
                  </FormControl>
                  <FormControl isRequired isInvalid={isAccountNameInvalid}>
                    <FormLabel>Account Name</FormLabel>
                    <Input value={accountName} onChange={handleAccountNameChange} />
                    <FormHelperText>The account name is an easy way for you to identify an account.</FormHelperText>
                    {
                      isAccountNameInvalid && <FormErrorMessage>The account name must be at least 1 character and can only composed of the following characters (_-[0-9][a-z][A-Z]).</FormErrorMessage>
                    }
                  </FormControl>
                  <FormControl isRequired isInvalid={isPasswordInvalid}>
                    <FormLabel>Password</FormLabel>
                    <Input type='password' value={password} onChange={handlePasswordChange} />
                    <FormHelperText>The password is used to encrypt your wallet sensitive information in your browser&lsquo;s secured local storage.</FormHelperText>
                    {
                      isPasswordInvalid && <FormErrorMessage>The password must be at least 8 characters.</FormErrorMessage>
                    }
                  </FormControl>
                  <FormControl isRequired isInvalid={isPasswordConfirmationInvalid}>
                    <FormLabel>Password Confirmation</FormLabel>
                    <Input type='password' value={passwordConfirmation} onChange={handlePasswordConfirmationChange} />
                    <FormHelperText>Confirm the password you entered in the Password field.</FormHelperText>
                    {
                      isPasswordConfirmationInvalid && <FormErrorMessage>The password confirmation is different than the password.</FormErrorMessage>
                    }
                  </FormControl>
                  {
                    !importingSecretPhrase &&
                    <>
                      <FormControl hidden={isSecretPhraseSaved}>
                        <FormLabel>Secret Phrase</FormLabel>
                        <Textarea value={secretPhrase} readOnly={true} />
                        <FormHelperText>The &quot;Secret Phrase&quot; is the &quot;Master Key&quot; that allows you to recover your accounts. You MUST keep it in a safe place as losing it will result in a loss of the funds.</FormHelperText>
                      </FormControl>
                      <FormControl isRequired>
                        <Checkbox isChecked={isSecretPhraseSaved} onChange={handleSavedSecretPhraseChange}>I confirm that I saved the &quot;Secret Phrase&quot; in a safe place.</Checkbox>
                      </FormControl>
                      <FormControl isRequired hidden={!isSecretPhraseSaved} isInvalid={!isSecretPhraseConfirmed}>
                        <FormLabel>Secret Phrase Confirmation</FormLabel>
                        {
                          secretPhraseConfirmation.map((word, index) => {
                            if (index === secretPhraseConfirmation.length - 1) {
                              return <Tag
                                margin={1}
                                cursor={'pointer'}
                                size='md'
                                key={index}
                                colorScheme='green'
                                onClick={() => onSecretWordConfirmationClick(index)}
                              >
                                <TagLeftIcon boxSize='12px' as={MinusIcon} />
                                <TagLabel>{word}</TagLabel>
                              </Tag>
                            } else {
                              return <Tag
                                margin={1}
                                size='md'
                                key={index}
                                colorScheme='green'
                              >
                                <TagLabel>{word}</TagLabel>
                              </Tag>
                            }
                          })
                        }
                        <Divider />
                        Secret Words available:
                        {
                          secretPhraseWords.map((word, index) => {
                            return <Tag
                              margin={1}
                              cursor={'pointer'}
                              size='md'
                              key={index}
                              colorScheme='blue'
                              onClick={() => onAvailableSecretWordClick(index)}
                            >
                              <TagLeftIcon boxSize='12px' as={AddIcon} />
                              <TagLabel>{word}</TagLabel>
                            </Tag>
                          })
                        }
                        <FormHelperText>Select the 12 words composing your &quot;Secret Phrase&quot; in the correct order.</FormHelperText>
                        {
                          !isSecretPhraseConfirmed && <FormErrorMessage>The &quot;Secret Phrase&quot; confirmation is different than the &quot;Secret Phrase&quot;.</FormErrorMessage>
                        }
                      </FormControl>
                    </>
                  }
                  {
                    importingSecretPhrase &&
                    <>
                      <FormControl isInvalid={!isSecretPhraseConfirmed} isRequired>
                        <FormLabel>Secret Phrase</FormLabel>
                        <Textarea value={secretPhrase} onChange={handleSecretPhraseChange} />
                        <FormHelperText>Type the 12 words composing your &quot;Secret Phrase&quot;, separated by blank spaces.</FormHelperText>
                        {
                          !isSecretPhraseConfirmed && <FormErrorMessage>The &quot;Secret Phrase&quot; should be composed of 12 words.</FormErrorMessage>
                        }
                      </FormControl>
                    </>
                  }
                </Stack>
              </CardBody>
              <Divider />
              <CardFooter>
                <Button disabled={isCreatingWallet || isCreateButtonDisabled} isLoading={isCreatingWallet} variant='solid' colorScheme='green' onClick={createWallet}>
                  Create wallet
                </Button>
              </CardFooter>
            </Card>
          </Skeleton>
        </Stack>
      </Box>
    </>
  )
}
