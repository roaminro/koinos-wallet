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
    name: string;
    keyPath?: string;
    address: string;
  }

  private?: {
    privateKey: string;
  }

  signers: Signer[]
}

export type Wallet = {
  name: string
  secretPhrase?: string
  accounts: Account[]
}

export class Vault {
  private vault: Wallet[]
  private publicVault: Wallet[]
  private locked: boolean

  constructor() {
    this.vault = []
    this.publicVault = []
    this.locked = true
  }

  async unlock(password: string, encryptedVault: string) {
    this.lock()

    this.vault = await decrypt(password, encryptedVault) as Wallet[]

    this.vault.forEach((wallet) => {
      const publicWallet: Wallet = {
        name: wallet.name,
        accounts: []
      }

      wallet.accounts.forEach((account) => {
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
            address: account.public.address
          },
          signers
        })
      })

      this.publicVault.push(publicWallet)
    })

    this.locked = false

    return this.publicVault
  }

  lock() {
    this.locked = true
    this.vault = []
    this.publicVault = []
  }

  isLocked() {
    return this.locked
  }

  async serialize(password: string) {
    return await encrypt(password, this.vault)
  }

  getWalletSecretPhrase(walletIndex: number) {
    if (this.locked) {
      throw new Error('you must unlock the vault first')
    }

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    return this.vault[walletIndex].secretPhrase!
  }

  getAccountPrivateKey(walletIndex: number, accountIndex: number) {
    if (this.locked) {
      throw new Error('you must unlock the vault first')
    }

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    if (accountIndex >= this.vault[walletIndex].accounts.length) {
      throw new Error(`no account present at index ${accountIndex}`)
    }

    return this.vault[walletIndex].accounts[accountIndex].private!.privateKey
  }

  addWallet(walletName: string, accountName: string, secretPhrase: string) {
    const hdKoinos = new HDKoinos(secretPhrase)
    const account = hdKoinos.deriveKeyAccount(0, accountName)

    this.vault.push({
      name: walletName,
      secretPhrase: secretPhrase,
      accounts: [{
        public: account.public,
        private: account.private,
        signers: []
      }]
    })

    this.publicVault.push({
      name: walletName,
      accounts: [{
        public: {
          name: account.public.name,
          address: account.public.address
        },
        signers: []
      }]
    })

    return this.publicVault
  }

  addAccount(walletIndex: number, accountName: string) {
    if (this.locked) {
      throw new Error('you must unlock the vault first')
    }

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    const hdKoinos = new HDKoinos(this.vault[walletIndex].secretPhrase!)
    const account = hdKoinos.deriveKeyAccount(this.vault[walletIndex].accounts.length, accountName)

    this.vault[walletIndex].accounts.push({
      public: account.public,
      private: account.private,
      signers: []
    })

    const publicAccount: Account = {
      public: {
        name: account.public.name,
        address: account.public.address
      },
      signers: []
    }

    this.publicVault[walletIndex].accounts.push(publicAccount)

    return publicAccount
  }

  importAccount(walletIndex: number, account: Account) {
    if (this.locked) {
      throw new Error('you must unlock the vault first')
    }

    if (walletIndex >= this.vault.length) {
      throw new Error(`no wallet present at index ${walletIndex}`)
    }

    this.vault[walletIndex].accounts.push(account)

    const signers: Signer[] = []
    account.signers.forEach(signer => {
      signers.push({
        public: {
          name: signer.public.name,
          address: signer.public.address,
        }
      })
    })

    const publicAccount: Account = {
      public: {
        name: account.public.name,
        address: account.public.address
      },
      signers
    }

    this.publicVault[walletIndex].accounts.push(publicAccount)

    return publicAccount
  }

  getAccounts() {
    return this.publicVault
  }
}