import { Wallet, Account } from '../util/Vault'

export interface IncomingMessage {
  command: string
  arguments?: UnlockArguments | AddWalletArguments | AddAccountArguments | ImportAccountArguments | GetWalletSecretRecoveryPhraseArguments | GetAccountPrivateKeyArguments | CheckPasswordArguments
}

export interface OutgoingMessage {
  result?: UnlockResult | AddWalletResult | AddAccountResult | ImportAccountResult | SerializeResult | IsLockedResult | GetAccountsResult | GetWalletSecretRecoveryPhraseResult | GetAccountPrivateKeyResult | CheckPasswordResult
}

export type UnlockArguments = {
  password: string
  encryptedVault?: string
}

export type UnlockResult = Wallet[]

export type AddWalletArguments = {
  walletName: string
  secretRecoveryPhrase?: string
}

export type AddWalletResult = Wallet

export type AddAccountArguments = {
  walletIndex: number
  accountName: string
}

export type AddAccountResult = Account

export type ImportAccountArguments = {
  walletIndex: number
  accountName: string
  accountPrivateKey: string
}

export type ImportAccountResult = Account

export type SerializeResult = string

export type CheckPasswordArguments = {
  password: string
}

export type CheckPasswordResult = void

export type IsLockedResult = boolean

export type GetAccountsResult = Wallet[]

export type GetWalletSecretRecoveryPhraseArguments = {
  walletIndex: number
}

export type GetWalletSecretRecoveryPhraseResult = string

export type GetAccountPrivateKeyArguments = {
  walletIndex: number
  accountIndex: number
}

export type GetAccountPrivateKeyResult = string