import {
  FiRepeat,
} from 'react-icons/fi'
import { Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, Button, useToast, IconButton, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, InputGroup, InputRightElement, Tooltip, Center, Textarea } from '@chakra-ui/react'
import { Contract, Provider, utils } from 'koilib'
import { ChangeEvent, useState } from 'react'

import { BackButton } from '../../components/BackButton'
import { useRouter } from 'next/router'
import { useContacts } from '../../context/ContactsProvider'
import useTranslation from 'next-translate/useTranslation'
import { isAlphanumeric } from '../../util/Utils'

export default function Add() {
  const { t } = useTranslation()
  const router = useRouter()
  const toast = useToast()
  const { contacts, addContact } = useContacts()

  const [isLoading, setIsLoading] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [contactNotes, setContactNotes] = useState('')


  const handleContactNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContactName(e.target.value)
  }

  const handleContactAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContactAddress(e.target.value)
  }

  const handleContactNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContactNotes(e.target.value)
  }

  const handleBtnClick = async () => {
    setIsLoading(true)

    try {

      addContact({
        address: contactAddress,
        name: contactName,
        notes: contactNotes
      })

      router.push('/contacts')

      toast({
        title: t('contacts:add.successToast.title'),
        description: t('contacts:add.successToast.description'),
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: t('contacts:add.errorToast.title'),
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isContactNameInvalid = contactName.length < 1 || !isAlphanumeric(contactName)
  const invalidContactAddress = !utils.isChecksumAddress(contactAddress)
  const contactAlreadyExists = contacts[contactAddress] !== undefined

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>{t('contacts:add.cardHeader.heading')}</Heading>
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

            <FormControl isRequired isInvalid={contactAlreadyExists || invalidContactAddress}>
              <FormLabel>{t('contacts:add.contactAddressField.label')}</FormLabel>
              <Input value={contactAddress} onChange={handleContactAddressChange} />
              <FormHelperText>{t('contacts:add.contactAddressField.helper')}</FormHelperText>
              {
                contactAlreadyExists && <FormErrorMessage>{t('contacts:add.contactAddressField.contactAlreadyExists')}</FormErrorMessage>
              }
              {
                invalidContactAddress && <FormErrorMessage>{t('contacts:add.contactAddressField.invalidContactAddress')}</FormErrorMessage>
              }
            </FormControl>

            <FormControl>
              <FormLabel>{t('contacts:add.contactNotesField.label')}</FormLabel>
              <Textarea value={contactNotes} onChange={handleContactNotesChange} />
              <FormHelperText>{t('contacts:add.contactNotesField.helper')}</FormHelperText>
            </FormControl>
            <Button
              isLoading={isLoading}
              isDisabled={isContactNameInvalid || contactAlreadyExists || invalidContactAddress}
              variant='solid'
              colorScheme='green'
              onClick={handleBtnClick}>
              {t('contacts:add.buttonLabel')}
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
