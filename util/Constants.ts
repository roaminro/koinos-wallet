import { Network } from '../context/NetworksProvider'

export const SETTINGS_KEY = 'SETTINGS'

export const VAULT_KEY = 'VAULT'

export const DEFAULT_AUTOLOCK_TIME_KEY = 'DEFAULT_AUTOLOCK_TIME'
export const AUTOLOCK_DEADLINE_KEY = 'AUTOLOCK_DEADLINE'

export const PUBLIC_PATHS = [
    '/',
    '/embed/wallet-connector',
    '/unlock',
    '/welcome',
    '/create-password',
    '/vault',
    '/networks'
]

export const VAULT_SERVICE_WORKER_ID = 'vault-connector-parent'

export const NETWORKS_KEY = 'NETWORKS'
export const SELECTED_NETWORK_KEY = 'SELECTED_NETWORK'
export const SELECTED_ACCOUNT_KEY = 'SELECTED_ACCOUNT'

export const MY_KOINOS_WALLET_CONNECTOR_CHILD_MESSENGER_ID = 'my-koinos-wallet-connector-child'
export const MY_KOINOS_WALLET_CONNECTOR_PARENT_MESSENGER_ID = 'my-koinos-wallet-connector-parent'