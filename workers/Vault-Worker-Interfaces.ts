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

export type UnlockResult = Record<string, Wallet>

export type TryDecryptArguments = {
  password: string
  encryptedVault: string
}

export type TryDecryptResult = void

export type AddWalletArguments = {
  walletName: string
  secretRecoveryPhrase?: string
}

export type AddWalletResult = Wallet

export type AddAccountArguments = {
  walletName: string
  accountName: string
}

export type AddAccountResult = Account

export type ImportAccountArguments = {
  walletName: string
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

export type GetAccountsResult = Record<string, Wallet>

export type GetWalletSecretRecoveryPhraseArguments = {
  walletName: string
}

export type GetWalletSecretRecoveryPhraseResult = string

export type GetAccountPrivateKeyArguments = {
  walletName: string
  accountName: string
}

export type GetAccountPrivateKeyResult = string

export type UpdateWalletNameArguments = {
  oldWalletName: string
  newWalletName: string
}

export type UpdateWalletNameResult = Wallet

export type RemoveWalletArguments = {
  walletName: string
}

export type RemoveWalletResult = Record<string, Wallet>


export type UpdateAccountNameArguments = {
  walletName: string
  oldAccountName: string
  newAccountName: string
}

export type UpdateAccountNameResult = Account

export type RemoveAccountArguments = {
  walletName: string
  accountName: string
}

export type RemoveAccountResult = Wallet

export type AddAccountSignersArguments = {
  walletName: string
  accountName: string
  signers: Record<string, Signer>
}

export type AddAccountSignersResult = Account

export type RemoveAccountSignerArguments = {
  walletName: string
  accountName: string
  signerName: string
}

export type RemoveAccountSignerResult = Account
