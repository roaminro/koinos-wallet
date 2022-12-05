import { Wallet, Account, Signer } from '../util/Vault'

export interface IncomingMessage {
  command: string
  arguments?:
  UnlockArguments
  | AddWalletArguments
  | AddAccountArguments
  | ImportAccountArguments
  | GetWalletSecretRecoveryPhraseArguments
  | GetAccountPrivateKeyArguments
  | CheckPasswordArguments
  | UpdateWalletNameArguments
  | RemoveWalletArguments
  | UpdateAccountNameArguments
  | RemoveAccountArguments
  | AddAccountSignersArguments
  | RemoveAccountSignerArguments
}

export interface OutgoingMessage {
  result?:
  UnlockResult
  | AddWalletResult
  | AddAccountResult
  | ImportAccountResult
  | SerializeResult
  | IsLockedResult
  | GetAccountsResult
  | GetWalletSecretRecoveryPhraseResult
  | GetAccountPrivateKeyResult
  | CheckPasswordResult
  | UpdateWalletNameResult
  | RemoveWalletResult
  | UpdateAccountNameResult
  | RemoveAccountResult
  | AddAccountSignersResult
  | RemoveAccountSignerResult
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
  accountAddress: string
  accountPrivateKey?: string
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

export type UpdateWalletNameArguments = {
  walletIndex: number
  walletName: string
}

export type UpdateWalletNameResult = Wallet

export type RemoveWalletArguments = {
  walletIndex: number
}

export type RemoveWalletResult = Wallet[]


export type UpdateAccountNameArguments = {
  walletIndex: number
  accountIndex: number
  accountName: string
}

export type UpdateAccountNameResult = Account

export type RemoveAccountArguments = {
  walletIndex: number
  accountIndex: number
}

export type RemoveAccountResult = Wallet

export type AddAccountSignersArguments = {
  walletIndex: number
  accountIndex: number
  signers: Signer[]
}

export type AddAccountSignersResult = Account

export type RemoveAccountSignerArguments = {
  walletIndex: number
  accountIndex: number
  signerIndex: number
}

export type RemoveAccountSignerResult = Account
