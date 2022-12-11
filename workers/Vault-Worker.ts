import { Messenger } from '../util/Messenger'
import { Vault } from '../util/Vault'
import { vaultWorkerLogLevel } from '../app.config'
import { IncomingMessage, OutgoingMessage, UnlockArguments, AddWalletArguments, AddAccountArguments, ImportAccountArguments, CheckPasswordArguments, GetWalletSecretRecoveryPhraseArguments, GetAccountPrivateKeyArguments, UpdateWalletNameArguments, RemoveWalletArguments, UpdateAccountNameArguments, RemoveAccountArguments, AddAccountSignersArguments, RemoveAccountSignerArguments, TryDecryptArguments, SignTransactionArguments, SignHashArguments } from './Vault-Worker-Interfaces'

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

      case 'tryDecrypt': {
        const { password, encryptedVault } = data.arguments as TryDecryptArguments
        await vault.tryDecrypt(password, encryptedVault)
        sendData({ })
        break
      }

      case 'addWallet': {
        const { walletName, secretRecoveryPhrase } = data.arguments as AddWalletArguments
        sendData({ result: vault.addWallet(walletName, secretRecoveryPhrase) })
        break
      }

      case 'addAccount': {
        const { walletId, accountName } = data.arguments as AddAccountArguments
        sendData({ result: vault.addAccount(walletId, accountName) })
        break
      }

      case 'importAccount': {
        const { walletId, accountName, accountAddress, accountPrivateKey } = data.arguments as ImportAccountArguments
        sendData({ result: vault.importAccount(walletId, accountName, accountAddress, accountPrivateKey) })
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
        const { walletId, password } = data.arguments as GetWalletSecretRecoveryPhraseArguments
        sendData({ result: vault.getWalletSecretRecoveryPhrase(walletId, password) })
        break
      }

      case 'getAccountPrivateKey': {
        const { walletId, accountId, password } = data.arguments as GetAccountPrivateKeyArguments
        sendData({ result: vault.getAccountPrivateKey(walletId, accountId, password) })
        break
      }

      case 'updateWalletName': {
        const { newWalletName, walletId } = data.arguments as UpdateWalletNameArguments
        sendData({ result: vault.updateWalletName(walletId, newWalletName) })
        break
      }

      case 'removeWallet': {
        const { walletId } = data.arguments as RemoveWalletArguments
        sendData({ result: vault.removeWallet(walletId) })
        break
      }

      case 'updateAccountName': {
        const { walletId, accountId, newAccountName } = data.arguments as UpdateAccountNameArguments
        sendData({ result: vault.updateAccountName(walletId, accountId, newAccountName) })
        break
      }

      case 'removeAccount': {
        const { walletId, accountId } = data.arguments as RemoveAccountArguments
        sendData({ result: vault.removeAccount(walletId, accountId) })
        break
      }

      case 'addAccountSigners': {
        const { walletId, accountId, signers } = data.arguments as AddAccountSignersArguments
        sendData({ result: vault.addAccountSigners(walletId, accountId, signers) })
        break
      }

      case 'removeAccountSigner': {
        const { walletId, accountId, signerId } = data.arguments as RemoveAccountSignerArguments
        sendData({ result: vault.removeAccountSigner(walletId, accountId, signerId) })
        break
      }

      case 'signTransaction': {
        const { signerAddress, transaction } = data.arguments as SignTransactionArguments
        sendData({ result: await vault.signTransaction(signerAddress, transaction) })
        break
      }

      case 'signHash': {
        const { signerAddress, hash } = data.arguments as SignHashArguments
        sendData({ result: await vault.signHash(signerAddress, hash) })
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
