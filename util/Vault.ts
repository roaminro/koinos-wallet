import { decrypt, encrypt } from '@metamask/browser-passworder'
import HDKoinos from './HDKoinos'

export interface Signer {
  public: {
    name: string;
    address: string;
  }

  private?: {
    privateKey: string;
  }
}

export interface Account {
  public: {
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

      for (const walletName in this.vault) {
        const wallet = this.vault[walletName]
        const publicWallet: Wallet = {
          name: wallet.name,
          accounts: {}
        }

        for (const accountName in wallet.accounts) {
          const account = wallet.accounts[accountName]
          const publicAccount: Account = {
            public: {
              name: account.public.name,
              address: account.public.address,
              keyPath: account.public.keyPath
            },
            signers: {}
          }

          for (const signerName in account.signers) {
            const signer = account.signers[signerName]
            publicAccount.signers[signerName] = {
              public: {
                name: signer.public.name,
                address: signer.public.address
              }
            }
          }

          publicWallet.accounts[accountName] = publicAccount
        }

        this.publicVault[walletName] = publicWallet
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

  async checkPassword(password: string) {
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

  private getNextAccountIndex(walletName: string) {
    if (this.vault[walletName] && this.vault[walletName].lastAccountKeyPath) {
      return parseInt(HDKoinos.parsePath(this.vault[walletName].lastAccountKeyPath!).accountIndex) + 1
    }

    return 0
  }

  getWalletSecretRecoveryPhrase(walletName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    return this.vault[walletName].secretRecoveryPhrase
  }

  getAccountPrivateKey(walletName: string, accountName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (!this.vault[walletName].accounts[accountName]) {
      throw new Error(`no account named ${accountName}`)
    }

    return this.vault[walletName].accounts[accountName].private?.privateKey
  }

  addWallet(walletName: string, secretRecoveryPhrase?: string) {
    this.checkVaultUnlocked()

    if (this.vault[walletName]) {
      throw new Error(`a wallet is already named ${walletName}`)
    }

    this.vault[walletName] = {
      name: walletName,
      secretRecoveryPhrase: secretRecoveryPhrase,
      accounts: {}
    }

    const publicWallet: Wallet = {
      name: walletName,
      accounts: {}
    }

    this.publicVault[walletName] = publicWallet

    return publicWallet
  }

  updateWalletName(oldWalletName: string, newWalletName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[oldWalletName]) {
      throw new Error(`no wallet named ${oldWalletName}`)
    }

    if (this.vault[newWalletName]) {
      throw new Error(`a wallet is already named ${newWalletName}`)
    }

    this.vault[oldWalletName].name = newWalletName
    this.publicVault[oldWalletName].name = newWalletName

    this.vault[newWalletName] = { ...this.vault[oldWalletName] }
    delete this.vault[oldWalletName]

    this.publicVault[newWalletName] = { ...this.publicVault[oldWalletName] }
    delete this.publicVault[oldWalletName]

    return this.publicVault[newWalletName]
  }

  removeWallet(walletName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    delete this.vault[walletName]
    delete this.publicVault[walletName]

    return this.publicVault
  }

  addAccount(walletName: string, accountName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (this.vault[walletName].accounts[accountName]) {
      throw new Error(`an account is already named ${accountName}`)
    }

    if (!this.vault[walletName].secretRecoveryPhrase) {
      throw new Error('wallet does not have a secret recovery phrase')
    }

    const accountKeyIndex = this.getNextAccountIndex(walletName)

    const hdKoinos = new HDKoinos(this.vault[walletName].secretRecoveryPhrase!)
    const account = hdKoinos.deriveKeyAccount(accountKeyIndex, accountName)

    this.vault[walletName].accounts[accountName] = {
      public: account.public,
      private: account.private,
      signers: {}
    }

    this.vault[walletName].lastAccountKeyPath = account.public.keyPath

    const publicAccount: Account = {
      public: {
        name: account.public.name,
        address: account.public.address,
      },
      signers: {}
    }

    this.publicVault[walletName].accounts[accountName] = publicAccount

    return publicAccount
  }

  updateAccountName(walletName: string, oldAccountName: string, newAccountName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (!this.vault[walletName].accounts[oldAccountName]) {
      throw new Error(`no account named ${oldAccountName}`)
    }

    if (this.vault[walletName].accounts[newAccountName]) {
      throw new Error(`an account is already named ${newAccountName}`)
    }

    this.vault[walletName].accounts[oldAccountName].public.name = newAccountName
    this.publicVault[walletName].accounts[oldAccountName].public.name = newAccountName

    this.vault[walletName].accounts[newAccountName] = { ...this.vault[walletName].accounts[oldAccountName] }
    delete this.vault[walletName].accounts[oldAccountName]

    this.publicVault[walletName].accounts[newAccountName] = { ...this.publicVault[walletName].accounts[oldAccountName] }
    delete this.publicVault[walletName].accounts[oldAccountName]

    return this.publicVault[walletName].accounts[newAccountName]
  }

  removeAccount(walletName: string, accountName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (!this.vault[walletName].accounts[accountName]) {
      throw new Error(`no account named ${accountName}`)
    }

    delete this.vault[walletName].accounts[accountName]
    delete this.publicVault[walletName].accounts[accountName]

    return this.publicVault[walletName]
  }

  importAccount(walletName: string, accountName: string, accountAddress: string, accountPrivateKey?: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (this.vault[walletName].accounts[accountName]) {
      throw new Error(`an account is already named ${accountName}`)
    }

    this.vault[walletName].accounts[accountName] = {
      public: {
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
        name: accountName,
        address: accountAddress
      },
      signers: {}
    }

    this.publicVault[walletName].accounts[accountName] = publicAccount

    return publicAccount
  }

  addAccountSigners(walletName: string, accountName: string, signers: Record<string, Signer>) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (!this.vault[walletName].accounts[accountName]) {
      throw new Error(`no account named ${accountName}`)
    }

    const existingSigners = this.vault[walletName].accounts[accountName].signers

    this.vault[walletName].accounts[accountName].signers = { ...existingSigners, ...signers }
    this.publicVault[walletName].accounts[accountName].signers = { ...signers }

    return this.publicVault[walletName].accounts[accountName]
  }

  removeAccountSigner(walletName: string, accountName: string, signerName: string) {
    this.checkVaultUnlocked()

    if (!this.vault[walletName]) {
      throw new Error(`no wallet named ${walletName}`)
    }

    if (!this.vault[walletName].accounts[accountName]) {
      throw new Error(`no account named ${accountName}`)
    }

    if (!this.vault[walletName].accounts[accountName].signers[signerName]) {
      throw new Error(`no signer named ${signerName}`)
    }

    delete this.vault[walletName].accounts[accountName].signers[signerName]
    delete this.publicVault[walletName].accounts[accountName].signers[signerName]

    return this.publicVault[walletName].accounts[accountName]
  }

  getAccounts() {
    return this.publicVault
  }
}