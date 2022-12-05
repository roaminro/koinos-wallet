import { Messenger } from '../util/Messenger'
import { Account, Vault, Wallet } from '../util/Vault'
import { vaultWorkerLogLevel } from '../app.config'

const debug = (...args: any) => {
  if (vaultWorkerLogLevel === 'debug') {
    console.log(...args)
  }
}

export interface IncomingMessage {
  command: string
  arguments?: UnlockArguments | AddWalletArguments | AddAccountArguments | ImportAccountArguments | GetWalletSecretRecoveryPhraseArguments | GetAccountPrivateKeyArguments | CheckPasswordArguments
}

export interface OutgoingMessage {
  result?: UnlockResult | AddWalletResult | AddAccountResult | ImportAccountResult | SerializeResult | IsLockedResult | GetAccountsResult | GetWalletSecretRecoveryPhraseResult | GetAccountPrivateKeyResult | CheckPasswordResult
}

export type UnlockArguments = {
  password: string
  encryptedVault?: string
}

export type UnlockResult = Wallet[]

export type AddWalletArguments = {
  walletName: string
  secretRecoveryPhrase?: string
}

export type AddWalletResult = Wallet

export type AddAccountArguments = {
  walletIndex: number
  accountName: string
}

export type AddAccountResult = Account

export type ImportAccountArguments = {
  walletIndex: number
  accountName: string
  accountPrivateKey: string
}

export type ImportAccountResult = Account

export type SerializeResult = string

export type CheckPasswordArguments = {
  password: string
}

export type CheckPasswordResult = void

export type IsLockedResult = boolean

export type GetAccountsResult = Wallet[]

export type GetWalletSecretRecoveryPhraseArguments = {
  walletIndex: number
}

export type GetWalletSecretRecoveryPhraseResult = string

export type GetAccountPrivateKeyArguments = {
  walletIndex: number
  accountIndex: number
}

export type GetAccountPrivateKeyResult = string

const messenger = new Messenger<IncomingMessage, OutgoingMessage>(self, 'vault-connector-parent', false)

const vault = new Vault()

self.addEventListener('install', (event) => {
  debug('installing a new version of the Vault')
  //@ts-ignore
  self.skipWaiting()
})

messenger.onMessage(({ data, sender }) => {
  debug('Vault onMessage:', sender, data)
  if (data.command === 'skipWaiting') {
    //@ts-ignore
    self.skipWaiting()
  }
})

messenger.onRequest(async ({ data, sender, sendData, sendError }) => {
  debug('Vault onRequest:', sender, data)

  try {
    switch (data.command) {
      case 'unlock': {
        const { password, encryptedVault } = data.arguments as UnlockArguments
        const wallets = await vault.unlock(password, encryptedVault)
        sendData({ result: wallets })
        break
      }

      case 'lock': {
        vault.lock()
        sendData({})
        break
      }

      case 'addWallet': {
        const { walletName, secretRecoveryPhrase } = data.arguments as AddWalletArguments
        const newWallet = await vault.addWallet(walletName, secretRecoveryPhrase)
        sendData({ result: newWallet })
        break
      }

      case 'addAccount': {
        const { walletIndex, accountName } = data.arguments as AddAccountArguments
        const newAccount = await vault.addAccount(walletIndex, accountName)
        sendData({ result: newAccount })
        break
      }

      case 'importAccount': {
        const { walletIndex, accountName, accountPrivateKey } = data.arguments as ImportAccountArguments
        const importedAccount = await vault.importAccount(walletIndex, accountName, accountPrivateKey)
        sendData({ result: importedAccount })
        break
      }

      case 'serialize': {
        sendData({ result: await vault.serialize() })
        break
      }

      case 'checkPassword': {
        const { password } = data.arguments as CheckPasswordArguments
        sendData({ result: await vault.checkPassword(password) })
        break
      }

      case 'isLocked': {
        sendData({ result: vault.isLocked() })
        break
      }

      case 'getAccounts': {
        sendData({ result: vault.getAccounts() })
        break
      }

      case 'getWalletSecretRecoveryPhrase': {
        const { walletIndex } = data.arguments as GetWalletSecretRecoveryPhraseArguments
        sendData({ result: await vault.getWalletSecretRecoveryPhrase(walletIndex) })
        break
      }

      case 'getAccountPrivateKey': {
        const { walletIndex, accountIndex } = data.arguments as GetAccountPrivateKeyArguments
        sendData({ result: await vault.getAccountPrivateKey(walletIndex, accountIndex) })
        break
      }

      default:
        sendError('command not supported')
        break
    }

    debug('vault-state', vault)
  } catch (error) {
    sendError((error as Error).message)
  }
})
