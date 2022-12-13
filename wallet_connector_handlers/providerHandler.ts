import { Provider } from 'koilib'
import { BlockJson, CallContractOperationJson, TransactionJson, TransactionReceipt } from 'koilib/lib/interface'
import { IncomingMessage, OutgoingMessage } from '../pages/embed/wallet-connector'
import { SendDataFn, SendErrorFn } from '../util/Messenger'
import { getErrorMessage } from '../util/Utils'

export interface CallArguments {
  method: string
  params: unknown
}

export interface GetNonceArguments {
  account: string
}

export interface GetAccountRcArguments {
  account: string
}

export interface GetTransactionsByIdArguments {
  transactionIds: string[]
}

export interface GetBlocksByIdArguments {
  blockIds: string[]
}

export interface GetBlocksArguments {
  height: number
  numBlocks: number
  idRef?: string
}

export interface GetBlockArguments {
  height: number
}

export interface WaitArguments {
  transactionId: string
  type: 'byTransactionId' | 'byBlock'
  timeout: number
}

export interface SendTransactionArguments {
  transaction: TransactionJson
  broadcast: boolean
}

export interface ReadContractArguments {
  operation: CallContractOperationJson
}

export interface SubmitBlockArguments {
  block: BlockJson
}

export const handler = (sender: string, data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  switch (data.command) {

    case 'call': {
      return call(data, sendData, sendError, provider)
    }

    case 'getNonce': {
      return getNonce(data, sendData, sendError, provider)
    }

    case 'getAccountRc': {
      return getAccountRc(data, sendData, sendError, provider)
    }

    case 'getTransactionsById': {
      return getTransactionsById(data, sendData, sendError, provider)
    }

    case 'getBlocksById': {
      return getBlocksById(data, sendData, sendError, provider)
    }

    case 'getHeadInfo': {
      return getHeadInfo(sendData, sendError, provider)
    }

    case 'getChainId': {
      return getChainId(sendData, sendError, provider)
    }

    case 'getBlocks': {
      return getBlocks(data, sendData, sendError, provider)
    }

    case 'getBlock': {
      return getBlock(data, sendData, sendError, provider)
    }

    case 'wait': {
      return wait(data, sendData, sendError, provider)
    }

    case 'sendTransaction': {
      return sendTransaction(data, sendData, sendError, provider)
    }

    case 'readContract': {
      return readContract(data, sendData, sendError, provider)
    }


    case 'submitBlock': {
      return submitBlock(data, sendData, sendError, provider)
    }

    default:
      sendError('command not supported')
      break
  }
}

const call = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { method, params } = JSON.parse(data.arguments!) as CallArguments
    sendData({ result: await provider.call(method, params) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getNonce = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { account } = JSON.parse(data.arguments!) as GetNonceArguments
    sendData({ result: await provider.getNonce(account) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getAccountRc = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { account } = JSON.parse(data.arguments!) as GetAccountRcArguments
    sendData({ result: await provider.getAccountRc(account) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getTransactionsById = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { transactionIds } = JSON.parse(data.arguments!) as GetTransactionsByIdArguments
    sendData({ result: await provider.getTransactionsById(transactionIds) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getBlocksById = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { blockIds } = JSON.parse(data.arguments!) as GetBlocksByIdArguments
    sendData({ result: await provider.getBlocksById(blockIds) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getHeadInfo = async (sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    sendData({ result: await provider.getHeadInfo() })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getChainId = async (sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    sendData({ result: await provider.getChainId() })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getBlocks = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { height, numBlocks, idRef } = JSON.parse(data.arguments!) as GetBlocksArguments
    sendData({ result: await provider.getBlocks(height, numBlocks, idRef) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const getBlock = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { height } = JSON.parse(data.arguments!) as GetBlockArguments
    sendData({ result: await provider.getBlock(height) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const wait = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { transactionId, type, timeout } = JSON.parse(data.arguments!) as WaitArguments
    sendData({ result: await provider.wait(transactionId, type, timeout) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const sendTransaction = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { transaction, broadcast } = JSON.parse(data.arguments!) as SendTransactionArguments
    sendData({ result: await provider.sendTransaction(transaction, broadcast) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const readContract = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { operation } = JSON.parse(data.arguments!) as ReadContractArguments
    sendData({ result: await provider.readContract(operation) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}

const submitBlock = async (data: IncomingMessage, sendData: SendDataFn<OutgoingMessage>, sendError: SendErrorFn, provider: Provider) => {
  try {
    const { block } = JSON.parse(data.arguments!) as SubmitBlockArguments
    sendData({ result: await provider.submitBlock(block) })
  } catch (error) {
    sendError(getErrorMessage(error))
  }
}
