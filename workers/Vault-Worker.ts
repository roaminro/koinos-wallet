import { Messenger } from '../util/Messenger'
import { Vault } from '../util/Vault'
import { vaultWorkerLogLevel } from '../app.config'
import { IncomingMessage, OutgoingMessage, UnlockArguments, AddWalletArguments, AddAccountArguments, ImportAccountArguments, CheckPasswordArguments, GetWalletSecretRecoveryPhraseArguments, GetAccountPrivateKeyArguments } from './Vault-Worker-Interfaces'

const debug = (...args: any) => {
  if (vaultWorkerLogLevel === 'debug') {
    console.log(...args)
  }
}

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
