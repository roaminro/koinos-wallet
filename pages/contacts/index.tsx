import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, IconButton, Tooltip, Heading, Text, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { BackButton } from '../../components/BackButton'
import { Contact, useContacts } from '../../context/ContactsProvider'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { MouseEvent } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import useTranslation from 'next-translate/useTranslation'

export default function Contacts() {
  const { t } = useTranslation()
  const toast = useToast()
  const router = useRouter()

  const { contacts, removeContact } = useContacts()

  const handleDeleteClick = (e: MouseEvent, contact: Contact) => {
    e.stopPropagation()

    NiceModal.show(ConfirmationDialog, {
      body: t('contacts:index.deleteConfirmationModal.body'),
      onAccept: async () => {
        removeContact(contact)
        toast({
          title: t('contacts:index.deleteConfirmationModal.toast.title'),
          description: t('contacts:index.deleteConfirmationModal.toast.description'),
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
            <Heading size='md'>{t('common:contacts')}</Heading>
          </Stack>
          <br />
          <Stack spacing={8} direction='row'>
            <Button colorScheme='blue' onClick={() => router.push('/contacts/add')}>
              {t('contacts:index.cardHeader.button')}
            </Button>
          </Stack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack>
            {
              Object.entries(contacts).map(([contactAddress, contact]) => {
                return (
                  <Card key={contactAddress} variant='outline'>
                    <CardBody
                      cursor='pointer'
                      onClick={() => router.push({ pathname: '/contacts/[contactAddress]', query: { contactAddress } })}
                    >
                      <HStack justifyContent='space-between' flexWrap='wrap'>
                        <Stack marginBottom='10px'>
                          <Heading size='md'>
                            {contact.name}
                          </Heading>
                          <Text>
                            {contact.address}
                          </Text>
                        </Stack>
                        <Stack spacing={4} direction='row'>
                          <Tooltip
                            label={t('contacts:index.cardBody.editTooltip')}
                            placement="top"
                            hasArrow
                          >
                            <IconButton
                              aria-label={t('contacts:index.cardBody.editTooltip')}
                              colorScheme='blue'
                              icon={<FiEdit />}
                              onClick={() => router.push({ pathname: '/contacts/[contactAddress]', query: { contactAddress } })}
                            />
                          </Tooltip>
                          <Tooltip
                            label={t('contacts:index.cardBody.deleteTooltip')}
                            placement="top"
                            hasArrow
                          >
                            <IconButton
                              aria-label={t('contacts:index.cardBody.deleteTooltip')}
                              colorScheme='red'
                              icon={<FiTrash />}
                              onClick={(e) => handleDeleteClick(e, contact)}
                            />
                          </Tooltip>
                        </Stack>
                      </HStack>
                    </CardBody>
                  </Card>
                )
              })
            }
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
