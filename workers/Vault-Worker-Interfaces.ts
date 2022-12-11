import { TransactionJson } from 'koilib/lib/interface'
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
  | SignTransactionArguments
  | SignHashArguments
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
  | SignTransactionResult
  | SignHashResult
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
  walletId: string
  accountName: string
}

export type AddAccountResult = Account

export type ImportAccountArguments = {
  walletId: string
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
  walletId: string
  password: string
}

export type GetWalletSecretRecoveryPhraseResult = string

export type GetAccountPrivateKeyArguments = {
  walletId: string
  accountId: string
  password: string
}

export type GetAccountPrivateKeyResult = string

export type UpdateWalletNameArguments = {
  walletId: string
  newWalletName: string
}

export type UpdateWalletNameResult = Wallet

export type RemoveWalletArguments = {
  walletId: string
}

export type RemoveWalletResult = Record<string, Wallet>


export type UpdateAccountNameArguments = {
  walletId: string
  accountId: string
  newAccountName: string
}

export type UpdateAccountNameResult = Account

export type RemoveAccountArguments = {
  walletId: string
  accountId: string
}

export type RemoveAccountResult = Wallet

export type AddAccountSignersArguments = {
  walletId: string
  accountId: string
  signers: Record<string, Signer>
}

export type AddAccountSignersResult = Account

export type RemoveAccountSignerArguments = {
  walletId: string
  accountId: string
  signerId: string
}

export type RemoveAccountSignerResult = Account

export type SignTransactionArguments = {
  signerAddress: string
  transaction: TransactionJson
}

export type SignTransactionResult = TransactionJson

export type SignHashArguments = {
  signerAddress: string
  hash: Uint8Array
}

export type SignHashResult = Uint8Array