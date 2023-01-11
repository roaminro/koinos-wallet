import { ReactNode, useContext, useState, createContext, useEffect } from 'react'
import { CONTACTS_KEY } from '../util/Constants'

export type Contact = {
  address: string
  name: string
  notes: string
}

type ContactsContextType = {
  contacts: Record<string, Contact>
  addContact: (contact: Contact) => void
  updateContact: (contact: Contact) => void
  removeContact: (contact: Contact) => void
}

export const ContactsContext = createContext<ContactsContextType>({
  contacts: {},
  addContact: (contact: Contact) => { },
  updateContact: (contact: Contact) => { },
  removeContact: (contact: Contact) => { }
})

export const useContacts = () => useContext(ContactsContext)

export const ContactsProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const [contacts, setContacts] = useState<Record<string, Contact>>({})

  useEffect(() => {
    const savedContacts = localStorage.getItem(CONTACTS_KEY)

    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    }

    const onStorageUpdate = (e: StorageEvent) => {
      const { key, newValue } = e
      if (newValue && key === CONTACTS_KEY) {
        setContacts(JSON.parse(newValue))
      }
    }

    window.addEventListener('storage', onStorageUpdate)

    return () => {
      window.removeEventListener('storage', onStorageUpdate)
    }
  }, [])

  const saveToLocalStorage = (contacts: Record<string, Contact>) => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
  }

  const addContact = (contact: Contact) => {
    const newContacts = { ...contacts, [contact.address]: contact }
    setContacts(newContacts)
    saveToLocalStorage(newContacts)
  }

  const removeContact = (contact: Contact) => {
    if (contacts[contact.address]) {
      const newContacts = { ...contacts }
      delete newContacts[contact.address]

      setContacts(newContacts)
      saveToLocalStorage(newContacts)
    }
  }

  const updateContact = (contact: Contact) => {
    if (contacts[contact.address]) {
      const newContacts = { ...contacts }
      newContacts[contact.address] = contact

      setContacts(newContacts)
      saveToLocalStorage(newContacts)
    }
  }

  return (
    <ContactsContext.Provider value={{
      contacts,
      addContact,
      updateContact,
      removeContact
    }}>
      {children}
    </ContactsContext.Provider>
  )
}