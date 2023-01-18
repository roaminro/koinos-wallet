import {
  FiRepeat,
} from 'react-icons/fi'
import { Text, Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, Button, useToast, IconButton, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, InputGroup, InputRightElement, Tooltip, Center, FormErrorMessage, Textarea } from '@chakra-ui/react'
import { Contract, Provider, utils } from 'koilib'
import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { BackButton } from '../../../components/BackButton'
import { Network, useNetworks } from '../../../context/NetworksProvider'
import { useTokens } from '../../../context/TokensProvider'
import useTranslation from 'next-translate/useTranslation'
import { useContacts } from '../../../context/ContactsProvider'
import { isAlphanumeric } from '../../../util/Utils'
import networks from '../../networks'
import tokens from '../../tokens'

export default function Edit() {
  const { t } = useTranslation()
  const toast = useToast()
  const router = useRouter()

  const { contacts, updateContact } = useContacts()


  const { contactAddress } = router.query

  const [isLoading, setIsLoading] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactNotes, setContactNotes] = useState('')

  const handleContactNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContactName(e.target.value)
  }

  const handleContactNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContactNotes(e.target.value)
  }

  const handleBtnClick = async () => {
    setIsLoading(true)

    try {

      updateContact({
        address: contactAddress as string,
        name: contactName,
        notes: contactNotes
      })

      router.push('/contacts')

      toast({
        title: t('contacts:edit.successToast.title'),
        description: t('contacts:edit.successToast.description'),
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: t('contacts:edit.errorToast.title'),
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contactAddress) {
      const contact = contacts[contactAddress as string]

      if (contact) {
        setContactName(contact.name)
        setContactNotes(contact.notes)
      }
    }
  }, [contactAddress, contacts])

  if (!contactAddress) return <></>

  const isContactNameInvalid = contactName.length < 1 || !isAlphanumeric(contactName)

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>Edit token</Heading>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack mt='6' spacing='3'>
          <FormControl isRequired isInvalid={isContactNameInvalid}>
              <FormLabel>{t('contacts:add.contactNameField.label')}</FormLabel>
              <Input value={contactName} onChange={handleContactNameChange} />
              <FormHelperText>{t('contacts:add.contactNameField.helper')}</FormHelperText>
              {
                isContactNameInvalid && <FormErrorMessage>{t('contacts:add.contactNameField.contactNameInvalid')}</FormErrorMessage>
              }
            </FormControl>

            <FormControl>
              <FormLabel>{t('contacts:add.contactAddressField.label')}</FormLabel>
              <Input isDisabled value={contactAddress} />
              <FormHelperText>{t('contacts:add.contactAddressField.helper')}</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>{t('contacts:add.contactNotesField.label')}</FormLabel>
              <Textarea value={contactNotes} onChange={handleContactNotesChange} />
              <FormHelperText>{t('contacts:add.contactNotesField.helper')}</FormHelperText>
            </FormControl>
            <Button
              isLoading={isLoading}
              variant='solid'
              colorScheme='green'
              onClick={handleBtnClick}>
              {t('contacts:edit.buttonLabel')}
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
