import { decrypt, encrypt } from '@metamask/browser-passworder'
import { Signer as KoilibSigner } from 'koilib'
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
    index: number
    address: string
  }

  private?: {
    privateKey?: string
  }

  signers: Signer[]
}

export type Wallet = {
  name: string
  secretRecoveryPhrase?: string
  index: number
  accounts: Account[]
}

export class Vault {
  private vault: Wallet[]
  private publicVault: Wallet[]
  private locked: boolean
  private password: string

  constructor() {
    this.vault = []
    this.publicVault = []
    this.locked = true
    this.password = ''
  }

  async unlock(password: string, encryptedVault?: string) {
    this.lock()

    if (encryptedVault) {
      this.vault = await decrypt(password, encryptedVault) as Wallet[]

      this.vault.forEach((wallet, walletIndex) => {
        const publicWallet: Wallet = {
          name: wallet.name,
          index: walletIndex,
          accounts: []
        }

        wallet.accounts.forEach((account, accountIndex) => {
          const signers: Signer[] = []

          account.signers.forEach((signer) => signers.push({
            public: {
              name: signer.public.name,
              address: signer.public.address
            }
          }))

          publicWallet.accounts.push({
            public: {
              name: account.public.name,
              index: accountIndex,
              address: account.public.address
            },
            signers
          })
        })

        this.publicVault.push(publicWallet)
      })
    }

    this.password = password
    this.locked = false

    return this.publicVault
  }

  lock() {
    this.locked = true
    this.vault = []
    this.publicVault = []
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

  private getNextAccountIndex(walletIndex: number) {
    for (let index = this.vault[walletIndex].accounts.length - 1; index >= 0; index--) {
      const account = this.vault[walletIndex].accounts[index]

      if (account.public.keyPath) {
        return parseInt(HDKoinos.parsePath(account.public.keyPath).accountIndex) + 1
      }
    }

    return 0
  }

  getWalletSecretRecoveryPhrase(walletIndex: number) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    return this.vault[walletIndex].secretRecoveryPhrase!
  }

  getAccountPrivateKey(walletIndex: number, accountIndex: number) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    if (accountIndex >= this.vault[walletIndex].accounts.length) {
      throw new Error(`no account present at index ${accountIndex}`)
    }

    return this.vault[walletIndex].accounts[accountIndex].private!.privateKey
  }

  addWallet(walletName: string, secretRecoveryPhrase?: string) {
    this.checkVaultUnlocked()

    const walletIndex = this.vault.length

    this.vault.push({
      name: walletName,
      index: walletIndex,
      secretRecoveryPhrase: secretRecoveryPhrase,
      accounts: []
    })

    const publicWallet: Wallet = {
      name: walletName,
      index: walletIndex,
      accounts: []
    }

    this.publicVault.push(publicWallet)

    return publicWallet
  }

  updateWalletName(walletIndex: number, walletName: string) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    this.vault[walletIndex].name = walletName
    this.publicVault[walletIndex].name = walletName

    return this.publicVault[walletIndex]
  }

  removeWallet(walletIndex: number) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    for (let index = 0; index < this.vault.length; index++) {
      if (index > walletIndex) {
        this.vault[index].index -= 1
      }
    }

    for (let index = 0; index < this.publicVault.length; index++) {
      if (index > walletIndex) {
        this.publicVault[index].index -= 1
      }
    }

    this.vault.splice(walletIndex, 1)
    this.publicVault.splice(walletIndex, 1)

    return this.publicVault
  }

  addAccount(walletIndex: number, accountName: string) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    const accountKeyIndex = this.getNextAccountIndex(walletIndex)

    const hdKoinos = new HDKoinos(this.vault[walletIndex].secretRecoveryPhrase!)
    const account = hdKoinos.deriveKeyAccount(accountKeyIndex, accountName)

    const accountIndex = this.vault[walletIndex].accounts.length

    this.vault[walletIndex].accounts.push({
      public: {
        ...account.public,
        index: accountIndex
      },
      private: account.private,
      signers: []
    })

    const publicAccount: Account = {
      public: {
        name: account.public.name,
        address: account.public.address,
        index: accountIndex
      },
      signers: []
    }

    this.publicVault[walletIndex].accounts.push(publicAccount)

    return publicAccount
  }

  updateAccountName(walletIndex: number, accountIndex: number, accountName: string) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    if (accountIndex >= this.vault[walletIndex].accounts.length) {
      throw new Error(`no account present at index ${accountIndex}`)
    }

    this.vault[walletIndex].accounts[accountIndex].public.name = accountName
    this.publicVault[walletIndex].accounts[accountIndex].public.name = accountName

    return this.publicVault[walletIndex].accounts[accountIndex]
  }

  removeAccount(walletIndex: number, accountIndex: number) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    if (accountIndex >= this.vault[walletIndex].accounts.length) {
      throw new Error(`no account present at index ${accountIndex}`)
    }

    for (let index = 0; index < this.vault[walletIndex].accounts.length; index++) {
      if (index > accountIndex) {
        this.vault[walletIndex].accounts[index].public.index -= 1
      }
    }

    for (let index = 0; index < this.publicVault[walletIndex].accounts.length; index++) {
      if (index > accountIndex) {
        this.publicVault[walletIndex].accounts[index].public.index -= 1
      }
    }

    this.vault[walletIndex].accounts.splice(accountIndex, 1)
    this.publicVault[walletIndex].accounts.splice(accountIndex, 1)

    return this.publicVault[walletIndex]
  }

  importAccount(walletIndex: number, accountName: string, accountAddress: string, accountPrivateKey?: string) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    const accountIndex = this.vault[walletIndex].accounts.length

    this.vault[walletIndex].accounts.push({
      public: {
        name: accountName,
        index: accountIndex,
        address: accountAddress
      },
      private: {
        privateKey: accountPrivateKey
      },
      signers: []
    })

    const publicAccount: Account = {
      public: {
        name: accountName,
        index: accountIndex,
        address: accountAddress
      },
      signers: []
    }

    this.publicVault[walletIndex].accounts.push(publicAccount)

    return publicAccount
  }

  addAccountSigners(walletIndex: number, accountIndex: number, signers: Signer[]) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    if (accountIndex >= this.vault[walletIndex].accounts.length) {
      throw new Error(`no account present at index ${accountIndex}`)
    }

    this.vault[walletIndex].accounts[accountIndex].signers.push(...signers)
    this.publicVault[walletIndex].accounts[accountIndex].signers.push(...signers)

    return this.publicVault[walletIndex].accounts[accountIndex]
  }

  removeAccountSigner(walletIndex: number, accountIndex: number, signerIndex: number) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    if (accountIndex >= this.vault[walletIndex].accounts.length) {
      throw new Error(`no account present at index ${accountIndex}`)
    }

    if (signerIndex >= this.vault[walletIndex].accounts[accountIndex].signers.length) {
      throw new Error(`no signer present at index ${signerIndex}`)
    }

    this.vault[walletIndex].accounts[accountIndex].signers.splice(signerIndex, 1)
    this.publicVault[walletIndex].accounts[accountIndex].signers.splice(signerIndex, 1)

    return this.publicVault[walletIndex].accounts[accountIndex]
  }

  getAccounts() {
    return this.publicVault
  }
}