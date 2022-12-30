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
  deleteAppPermissions: (appPermissions: AppPermissions) => void
}

export const PermissionsContext = createContext<PermissionsContextType>({
  permissions: {},
  updateAppPermissions: (appPermissions: AppPermissions) => { },
  deleteAppPermissions: (appPermissions: AppPermissions) => { }
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
  }, [])

  useEffect(() => {
    if (Object.keys(permissions).length) {
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
    }
  }, [permissions])

  const updateAppPermissions = (appPermissions: AppPermissions) => {
    if (appPermissions.id) {
      permissions[appPermissions.id] = appPermissions
      setPermissions({ ...permissions })
    }
  }

  const deleteAppPermissions = (appPermissions: AppPermissions) => {
    if (appPermissions.id && permissions[appPermissions.id]) {
      delete permissions[appPermissions.id]
      setPermissions({ ...permissions })
    }
  }

  return (
    <PermissionsContext.Provider value={{
      permissions,
      updateAppPermissions,
      deleteAppPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  )
}