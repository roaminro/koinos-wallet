import { Provider, utils } from 'koilib'
import { TransactionJson, TransactionReceipt } from 'koilib/lib/interface'
import useSWR from 'swr'
import { useNetworks } from '../context/NetworksProvider'

export type HistoryTransaction = {
  seq_num?: string,
  trx: {
    receipt: TransactionReceipt,
    transaction: TransactionJson
  }
}

export const useAccountHistory = (accountAddress?: string, limit: number = 10, seqNum?: string) => {
  const { provider, selectedNetwork } = useNetworks()

  //@ts-ignore provider and accountAddress are not undefined when swr calls the fetcher
  const { data, error } = useSWR(selectedNetwork && provider && accountAddress ? `${selectedNetwork.chainId}_${accountAddress}_history_${seqNum}_${limit}` : null, getAccountHistory(accountAddress, limit, provider, seqNum))

  return {
    transactions: data,
    isLoading: !error && !data,
    isError: error
  }
}

const getAccountHistory =
  (
    account: string,
    limit: number = 10,
    provider: Provider,
    seqNum?: string
  ): (() => Promise<HistoryTransaction[]>) =>
    async () => {
      const { values } = await provider.call<{
        values?: HistoryTransaction[]
      }>('account_history.get_account_history', {
        address: account,
        limit,
        ascending: false,
        irreversible: false,
        ...(seqNum && { seq_num: seqNum })
      })

      if (!values) {
        return []
      }

      return values
    }

export function asFloat(value: string, decimals: number): number {
  if (!value) return 0
  return parseFloat(utils.formatUnits(value, decimals))
}