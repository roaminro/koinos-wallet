import { Messenger } from '../util/Messenger'
import { Vault } from '../util/Vault'
import { vaultWorkerLogLevel } from '../app.config'

const debug = (...args: any) => {
  if (vaultWorkerLogLevel === 'debug') {
    console.log(...args)
  }
}

export interface IncomingMessage {
  command: string
  arguments?: string
}

export interface OutgoingMessage {
  result?: string
}

const messenger = new Messenger<IncomingMessage, OutgoingMessage>(self, 'vault-connector-parent', false)

const vault = new Vault()

self.addEventListener('install', (event) => {
  debug('installing a new version of the Vault')
  //@ts-ignore
  self.skipWaiting()
})

messenger.onMessage(({ data, sender }) => {
  debug('Vault onMessage:',sender,  data)
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
        const { password, encryptedVault } = JSON.parse(data.arguments!)
        const wallets = await vault.unlock(password, encryptedVault)
        sendData({ result: JSON.stringify(wallets) })
        break
      }

      case 'lock': {
        vault.lock()
        sendData({})
        break
      }

      case 'addWallet': {
        const { walletName, accountName, secretPhrase } = JSON.parse(data.arguments!)
        const newWallets = await vault.addWallet(walletName, accountName, secretPhrase)
        sendData({ result: JSON.stringify(newWallets) })
        break
      }

      case 'addAccount': {
        const { walletIndex, accountName } = JSON.parse(data.arguments!)
        const newAccount = await vault.addAccount(walletIndex, accountName)
        sendData({ result: JSON.stringify(newAccount) })
        break
      }

      case 'importAccount': {
        const { walletIndex, account } = JSON.parse(data.arguments!)
        const inportedAccount = await vault.importAccount(walletIndex, account)
        sendData({ result: JSON.stringify(inportedAccount) })
        break
      }

      case 'serialize': {
        const { password } = JSON.parse(data.arguments!)
        sendData({ result: await vault.serialize(password) })
        break
      }

      case 'isLocked': {
        sendData({ result: JSON.stringify(vault.isLocked()) })
        break
      }
      
      case 'getAccounts': {
        sendData({ result: JSON.stringify(vault.getAccounts()) })
        break
      }

      case 'getWalletSecretPhrase': {
        const { walletIndex } = JSON.parse(data.arguments!)
        sendData({ result: JSON.stringify(await vault.getWalletSecretPhrase(walletIndex)) })
        break
      }

      case 'getAccountPrivateKey': {
        const { walletIndex, accountIndex } = JSON.parse(data.arguments!)
        sendData({ result: JSON.stringify(await vault.getAccountPrivateKey(walletIndex, accountIndex)) })
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
