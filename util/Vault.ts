import { decrypt, encrypt } from '@metamask/browser-passworder'
import { Signer as KoilibSigner } from 'koilib'
import { TransactionJson } from 'koilib/lib/interface'
import HDKoinos from './HDKoinos'

export interface Signer {
  public: {
    id: string
    name: string;
    address: string;
  }

  private?: {
    privateKey: string;
  }
}

export interface Account {
  public: {
    id: string
    name: string
    keyPath?: string
    address: string
  }

  private?: {
    privateKey?: string
  }

  signers: Record<string, Signer>
}

export type Wallet = {
  id: string
  name: string
  secretRecoveryPhrase?: string
  lastAccountKeyPath?: string
  accounts: Record<string, Account>
}

export class Vault {
  private vault: Record<string, Wallet>
  private publicVault: Record<string, Wallet>
  private locked: boolean
  private password: string

  constructor() {
    this.vault = {}
    this.publicVault = {}
    this.locked = true
    this.password = ''
  }

  async unlock(password: string, encryptedVault?: string) {
    this.lock()

    if (encryptedVault) {
      this.vault = await decrypt(password, encryptedVault) as Record<string, Wallet>

      for (const walletId in this.vault) {
        const wallet = this.vault[walletId]
        const publicWallet: Wallet = {
          id: wallet.id,
          name: wallet.name,
          accounts: {}
        }

        for (const accountId in wallet.accounts) {
          const account = wallet.accounts[accountId]
          const publicAccount: Account = {
            public: {
              id: account.public.id,
              name: account.public.name,
              address: account.public.address,
              keyPath: account.public.keyPath
            },
            signers: {}
          }

          for (const signerId in account.signers) {
            const signer = account.signers[signerId]
            publicAccount.signers[signerId] = {
              public: {
                id: signer.public.id,
                name: signer.public.name,
                address: signer.public.address
              }
            }
          }

          publicWallet.accounts[accountId] = publicAccount
        }

        this.publicVault[walletId] = publicWallet
      }
    }

    this.password = password
    this.locked = false

    return this.publicVault
  }

  async tryDecrypt(password: string, encryptedVault: string) {
    await decrypt(password, encryptedVault) as Record<string, Wallet>
  }

  lock() {
    this.locked = true
    this.vault = {}
    this.publicVault = {}
    this.password = ''
  }

  isLocked() {
    return this.locked
  }

  checkPassword(password: string) {
    this.checkVaultUnlocked()

    if (password !== this.password) {
      throw new Error('invalid password')
    }
  }

  async serialize() {
    this.checkVaultUnlocked()

    return await encrypt(this.password, this.vault)
  }

  private checkVaultUnlocked() {
    if (this.locked) {
      throw new Error('you must unlock the vault first')
    }
  }

  private getNextAccountIndex(walletId: string) {
    if (this.vault[walletId] && this.vault[walletId].lastAccountKeyPath) {
      return parseInt(HDKoinos.parsePath(this.vault[walletId].lastAccountKeyPath!).accountIndex) + 1
    }

    return 0
  }

  private findAccountByAddress(address: string) {
    // a given address can be used by several wallets and accounts
    // so return:
    //  - the first account found that has a private key
    //  - or, an account that matches address
    let foundAccount: Account|null = null
    for (const walletId in this.vault) {
      const wallet = this.vault[walletId]

      for (const accountId in wallet.accounts) {
        // found an account that matches address
        if (wallet.accounts[accountId].public.address === address) {
          // does it have a private key?
          if (wallet.accounts[accountId].private?.privateKey) {
            return wallet.accounts[accountId]
          }

          foundAccount = wallet.accounts[accountId]
        }
      }
    }

    return foundAccount
  }

  getWalletSecretRecoveryPhrase(walletId: string, password: string) {
    this.checkVaultUnlocked()
    this.checkPassword(password)

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    return this.vault[walletId].secretRecoveryPhrase
  }

  getAccountPrivateKey(walletId: string, accountId: string, password: string) {
    this.checkVaultUnlocked()
    this.checkPassword(password)

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    if (!this.vault[walletId].accounts[accountId]) {
      throw new Error(`no account with id ${accountId}`)
    }

    return this.vault[walletId].accounts[accountId].private?.privateKey
  }

  addWallet(walletName: string, secretRecoveryPhrase?: string) {
    this.checkVaultUnlocked()

    const walletId = crypto.randomUUID()

    this.vault[walletId] = {
      id: walletId,
      name: walletName,
      secretRecoveryPhrase: secretRecoveryPhrase,
      accounts: {}
    }

    const publicWallet: Wallet = {
      id: walletId,
      name: walletName,
      accounts: {}
    }

    this.publicVault[walletId] = publicWallet

    return publicWallet
  }

  updateWalletName(walletId: string, newWalletName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    this.vault[walletId].name = newWalletName
    this.publicVault[walletId].name = newWalletName

    return this.publicVault[walletId]
  }

  removeWallet(walletId: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    delete this.vault[walletId]
    delete this.publicVault[walletId]

    return this.publicVault
  }

  addAccount(walletId: string, accountName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    if (!this.vault[walletId].secretRecoveryPhrase) {
      throw new Error('wallet does not have a secret recovery phrase')
    }

    const accountKeyIndex = this.getNextAccountIndex(walletId)

    const hdKoinos = new HDKoinos(this.vault[walletId].secretRecoveryPhrase!)
    const account = hdKoinos.deriveKeyAccount(accountKeyIndex, accountName)
    const accountId = crypto.randomUUID()

    this.vault[walletId].accounts[accountId] = {
      public: {
        id: accountId,
        ...account.public
      },
      private: account.private,
      signers: {}
    }

    this.vault[walletId].lastAccountKeyPath = account.public.keyPath

    const publicAccount: Account = {
      public: {
        id: accountId,
        ...account.public
      },
      signers: {}
    }

    this.publicVault[walletId].accounts[accountId] = publicAccount

    return publicAccount
  }

  updateAccountName(walletId: string, accountId: string, newAccountName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    if (!this.vault[walletId].accounts[accountId]) {
      throw new Error(`no account with id ${accountId}`)
    }

    this.vault[walletId].accounts[accountId].public.name = newAccountName
    this.publicVault[walletId].accounts[accountId].public.name = newAccountName

    return this.publicVault[walletId].accounts[accountId]
  }

  removeAccount(walletId: string, accountId: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    if (!this.vault[walletId].accounts[accountId]) {
      throw new Error(`no account with id ${accountId}`)
    }

    delete this.vault[walletId].accounts[accountId]
    delete this.publicVault[walletId].accounts[accountId]

    return this.publicVault[walletId]
  }

  importAccount(walletId: string, accountName: string, accountAddress: string, accountPrivateKey?: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    const accountId = crypto.randomUUID()

    this.vault[walletId].accounts[accountId] = {
      public: {
        id: accountId,
        name: accountName,
        address: accountAddress
      },
      private: {
        privateKey: accountPrivateKey
      },
      signers: {}
    }

    const publicAccount: Account = {
      public: {
        id: accountId,
        name: accountName,
        address: accountAddress
      },
      signers: {}
    }

    this.publicVault[walletId].accounts[accountId] = publicAccount

    return publicAccount
  }

  addAccountSigners(walletId: string, accountId: string, signers: Record<string, Signer>) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    if (!this.vault[walletId].accounts[accountId]) {
      throw new Error(`no account with id ${accountId}`)
    }

    const existingSigners = this.vault[walletId].accounts[accountId].signers

    this.vault[walletId].accounts[accountId].signers = { ...existingSigners, ...signers }
    this.publicVault[walletId].accounts[accountId].signers = { ...signers }

    return this.publicVault[walletId].accounts[accountId]
  }

  removeAccountSigner(walletId: string, accountId: string, signerId: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletId]) {
      throw new Error(`no wallet with id ${walletId}`)
    }

    if (!this.vault[walletId].accounts[accountId]) {
      throw new Error(`no account with id ${accountId}`)
    }

    if (!this.vault[walletId].accounts[accountId].signers[signerId]) {
      throw new Error(`no signer with id ${signerId}`)
    }

    delete this.vault[walletId].accounts[accountId].signers[signerId]
    delete this.publicVault[walletId].accounts[accountId].signers[signerId]

    return this.publicVault[walletId].accounts[accountId]
  }

  getAccounts() {
    return this.publicVault
  }

  async signTransaction(signerAddress: string, transaction: TransactionJson) {
    const account = this.findAccountByAddress(signerAddress)

    if (!account) {
      throw new Error(`no account found for signer address ${signerAddress}`)
    }

    if (!account.private || !account.private.privateKey) {
      throw new Error(`no private key found for signer address ${signerAddress}`)
    }

    let signer = KoilibSigner.fromWif(account.private.privateKey)

    let signedTransaction = await signer.signTransaction(transaction)

    for (const signerName in account.signers) {
      const signerInfo = account.signers[signerName]
      if (signerInfo.private && signerInfo.private.privateKey) {
        signer = KoilibSigner.fromWif(signerInfo.private.privateKey)
        signedTransaction = await signer.signTransaction(signedTransaction)
      }
    }

    return signedTransaction
  }

  async signHash(signerAddress: string, hash: Uint8Array) {
    const account = this.findAccountByAddress(signerAddress)

    if (!account) {
      throw new Error(`no account found for signer address ${signerAddress}`)
    }

    if (!account.private || !account.private.privateKey) {
      throw new Error(`no private key found for signer address ${signerAddress}`)
    }

    const signer = KoilibSigner.fromWif(account.private.privateKey)

    return await signer.signHash(hash)
  }
}