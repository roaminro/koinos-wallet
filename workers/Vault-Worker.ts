import { Messenger } from '../util/Messenger'
import { Vault } from '../util/Vault'
import { vaultWorkerLogLevel } from '../app.config'
import { IncomingMessage, OutgoingMessage, UnlockArguments, AddWalletArguments, AddAccountArguments, ImportAccountArguments, CheckPasswordArguments, GetWalletSecretRecoveryPhraseArguments, GetAccountPrivateKeyArguments, UpdateWalletNameArguments, RemoveWalletArguments, UpdateAccountNameArguments, RemoveAccountArguments, AddAccountSignersArguments, RemoveAccountSignerArguments } from './Vault-Worker-Interfaces'

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
        sendData({ result: await vault.unlock(password, encryptedVault) })
        break
      }

      case 'lock': {
        vault.lock()
        sendData({})
        break
      }

      case 'addWallet': {
        const { walletName, secretRecoveryPhrase } = data.arguments as AddWalletArguments
        sendData({ result: vault.addWallet(walletName, secretRecoveryPhrase) })
        break
      }

      case 'addAccount': {
        const { walletIndex, accountName } = data.arguments as AddAccountArguments
        sendData({ result: vault.addAccount(walletIndex, accountName) })
        break
      }

      case 'importAccount': {
        const { walletIndex, accountName, accountPrivateKey } = data.arguments as ImportAccountArguments
        sendData({ result: vault.importAccount(walletIndex, accountName, accountPrivateKey) })
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
        sendData({ result: vault.getWalletSecretRecoveryPhrase(walletIndex) })
        break
      }

      case 'getAccountPrivateKey': {
        const { walletIndex, accountIndex } = data.arguments as GetAccountPrivateKeyArguments
        sendData({ result: vault.getAccountPrivateKey(walletIndex, accountIndex) })
        break
      }

      case 'updateWalletName': {
        const { walletIndex, walletName } = data.arguments as UpdateWalletNameArguments
        sendData({ result: vault.updateWalletName(walletIndex, walletName) })
        break
      }

      case 'removeWallet': {
        const { walletIndex } = data.arguments as RemoveWalletArguments
        sendData({ result: vault.removeWallet(walletIndex) })
        break
      }

      case 'updateAccounttName': {
        const { walletIndex, accountIndex, accountName } = data.arguments as UpdateAccountNameArguments
        sendData({ result: vault.updateAccountName(walletIndex, accountIndex, accountName) })
        break
      }

      case 'removeAccount': {
        const { walletIndex, accountIndex } = data.arguments as RemoveAccountArguments
        sendData({ result: vault.removeAccount(walletIndex, accountIndex) })
        break
      }

      case 'addAccountSigners': {
        const { walletIndex, accountIndex, signers } = data.arguments as AddAccountSignersArguments
        sendData({ result: vault.addAccountSigners(walletIndex, accountIndex, signers) })
        break
      }

      case 'removeAccountSigner': {
        const { walletIndex, accountIndex, signerIndex } = data.arguments as RemoveAccountSignerArguments
        sendData({ result: vault.removeAccountSigner(walletIndex, accountIndex, signerIndex) })
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
