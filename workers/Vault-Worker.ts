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

messenger.onMessage(({ data, sender }) => {
  debug('Vault onMessage:', data)
  if (data.command === 'skipWaiting') {
    //@ts-ignore
    self.skipWaiting()
  }
})

messenger.onRequest(async ({ data, sender, sendData, sendError }) => {
  debug('Vault onRequest:', data)

  try {
    if (data.command === 'unlock') {
      const { password, encryptedVault } = JSON.parse(data.arguments!)
      const wallets = await vault.unlock(password, encryptedVault)
      sendData({ result: JSON.stringify(wallets) })
    } else if (data.command === 'lock') {
      vault.lock()
      sendData({})
    } else if (data.command === 'addWallet') {
      const { walletName, accountName, secretPhrase } = JSON.parse(data.arguments!)
      const newWallets = await vault.addWallet(walletName, accountName, secretPhrase)
      sendData({ result: JSON.stringify(newWallets) })
    } else if (data.command === 'serialize') {
      const { password } = JSON.parse(data.arguments!)
      sendData({ result: await vault.serialize(password) })
    } else if (data.command === 'isLocked') {
      sendData({ result: JSON.stringify(vault.isLocked()) })
    } else if (data.command === 'getAccounts') {
      sendData({ result: JSON.stringify(vault.getAccounts()) })
    }

    debug('vault-state', vault)
  } catch (error) {
    sendError((error as Error).message)
  }
})


self.addEventListener('install', (event) => {
  debug('installing a new version of the Vault')
  //@ts-ignore
  self.skipWaiting()
})
