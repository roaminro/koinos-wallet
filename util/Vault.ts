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

  async addWallet(walletName: string, accountName: string, secretPhrase: string) {
    const hdKoinos = new HDKoinos(secretPhrase)
    const account = hdKoinos.deriveKeyAccount(0, accountName)

    this.vault.push({
      name: walletName,
      secretPhrase: secretPhrase,
      accounts:[{
        public: account.public,
        private: account.private,
        signers: []
      }]
    })

    this.publicVault.push({
      name: walletName,
      accounts:[{
        public: {
          name: account.public.name,
          address: account.public.address
        },
        signers: []
      }]
    })

    return this.publicVault
  }

  getAccounts() {
    return this.publicVault
  }
}