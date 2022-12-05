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
    privateKey: string
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
    if (password !== this.password) {
      throw new Error('invalid password')
      
    }
  }

  async serialize() {
    return await encrypt(this.password, this.vault)
  }

  private checkVaultUnlocked() {
    if (this.locked) {
      throw new Error('you must unlock the vault first')
    }
  }

  private getLastAccountKeyPath(walletIndex: number) {
    for (let index = this.vault[walletIndex].accounts.length - 1; index >= 0; index--) {
      const account = this.vault[walletIndex].accounts[index]

      if (account.public.keyPath) {
        account.public.keyPath
      }
    }

    return "m/44'/659'/0'/0/0"
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

  addAccount(walletIndex: number, accountName: string) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    const lastAccountKeyPath = this.getLastAccountKeyPath(walletIndex)
    const accountKeyIndex = parseInt(HDKoinos.parsePath(lastAccountKeyPath).accountIndex) + 1

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

  importAccount(walletIndex: number, accountName: string, accountPrivateKey: string) {
    this.checkVaultUnlocked()

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    const accountIndex = this.vault[walletIndex].accounts.length
    const accountAddress = KoilibSigner.fromWif(accountPrivateKey).getAddress()

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

  getAccounts() {
    return this.publicVault
  }
}