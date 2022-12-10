import { SignerInterface } from 'koilib'
import {
  BlockJson,
  SendTransactionOptions,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from 'koilib/lib/interface'

export function getSigner(signerAddress: string): SignerInterface {
  return {
    getAddress: () => signerAddress,

    getPrivateKey: (): string => {
      throw new Error('getPrivateKey is not available')
    },

    signHash: (hash: Uint8Array): Promise<Uint8Array> => {
      return new Promise(resolve => resolve(new Uint8Array()))
    },

    signMessage: (message: string | Uint8Array): Promise<Uint8Array> => {
      return new Promise(resolve => resolve(new Uint8Array()))
    },

    prepareTransaction: async (
      transaction: TransactionJson
    ): Promise<TransactionJson> => {
      return new Promise(resolve => resolve({}))
    },

    signTransaction: async (
      transaction: TransactionJson,
      abis?: SendTransactionOptions['abis']
    ): Promise<TransactionJson> => {
      return new Promise(resolve => resolve({}))

    },

    sendTransaction: async (
      tx: TransactionJson,
      optsSend?: SendTransactionOptions
    ): Promise<{
      receipt: TransactionReceipt;
      transaction: TransactionJsonWait;
    }> => {
      return new Promise(resolve => resolve({
        receipt: {
          compute_bandwidth_used: '',
          disk_storage_used: '',
          events: [],
          id: '',
          logs: [],
          max_payer_rc: '',
          network_bandwidth_used: '',
          payer: '',
          rc_limit: '',
          rc_used: '',
          reverted: false
        },
        transaction: {
          wait: () => new Promise(resolve => resolve({
            blockId: ''
          }))
        }
      }))

    },

    prepareBlock: (): Promise<BlockJson> => {
      throw new Error('prepareBlock is not available')
    },

    signBlock: (): Promise<BlockJson> => {
      throw new Error('signBlock is not available')
    },
  }
}

export default getSigner