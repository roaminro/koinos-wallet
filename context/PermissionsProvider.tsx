import { ReactNode, useContext, useState, createContext, useEffect } from 'react'
import { PERMISSIONS_KEY } from '../util/Constants'

export type Scope = string
export type Command = string
export type Permissions = Record<Scope, Command[]>

export type AppPermissions = {
  id: string,
  url: string,
  permissions: Permissions
}

type PermissionsContextType = {
  permissions: Record<string, AppPermissions>
  updateAppPermissions: (appPermissions: AppPermissions) => void
  removeAppPermissions: (appPermissions: AppPermissions) => void
}

export const PermissionsContext = createContext<PermissionsContextType>({
  permissions: {},
  updateAppPermissions: (appPermissions: AppPermissions) => { },
  removeAppPermissions: (appPermissions: AppPermissions) => { }
})

export const usePermissions = () => useContext(PermissionsContext)

export const PermissionsProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const [permissions, setPermissions] = useState<Record<string, AppPermissions>>({})

  useEffect(() => {
    const savedPermissions = localStorage.getItem(PERMISSIONS_KEY)

    if (savedPermissions) {
      setPermissions(JSON.parse(savedPermissions))
    }

    const onStorageUpdate = (e: StorageEvent) => {
      const { key, newValue } = e
      if (newValue && key === PERMISSIONS_KEY) {
        setPermissions(JSON.parse(newValue))
      }
    }

    window.addEventListener('storage', onStorageUpdate)
    
    return () => {
      window.removeEventListener('storage', onStorageUpdate)
    }
  }, [])

  const saveToLocalStorage = (permissions: Record<string, AppPermissions>) => {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
  }

  const updateAppPermissions = (appPermissions: AppPermissions) => {
    if (appPermissions.id) {
      permissions[appPermissions.id] = appPermissions
      setPermissions({ ...permissions })
      saveToLocalStorage(permissions)
    }
  }

  const removeAppPermissions = (appPermissions: AppPermissions) => {
    if (appPermissions.id && permissions[appPermissions.id]) {
      delete permissions[appPermissions.id]
      setPermissions({ ...permissions })
      saveToLocalStorage(permissions)
    }
  }

  return (
    <PermissionsContext.Provider value={{
      permissions,
      updateAppPermissions,
      removeAppPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  )
}