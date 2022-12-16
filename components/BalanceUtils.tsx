import { Contract, Provider, utils } from 'koilib'
import useSWR from 'swr'
import { useNetworks } from '../context/NetworksProvider'

export const useTokenBalance = (accountAddress?: string, tokenAddress?: string) => {
  const { provider } = useNetworks()

  const contract = new Contract({
    id: tokenAddress,
    abi: utils.tokenAbi,
    provider
  })

  //@ts-ignore provider and accountAddress and tokenAddress are not undefined when swr calls the fetcher
  const { data, error } = useSWR(() => provider && accountAddress && tokenAddress ? `${accountAddress}_${tokenAddress}_balance` : null, getTokenBalanceFetcher(accountAddress, contract))

  return {
    balance: data,
    isLoading: !error && !data,
    isError: error
  }
}

export const useManaBalance = (accountAddress?: string) => {
  const { provider, selectedNetwork } = useNetworks()

  //@ts-ignore provider and accountAddress are not undefined when swr calls the fetcher
  const { data, error } = useSWR(selectedNetwork && provider && accountAddress ? `${selectedNetwork.chainId}_${accountAddress}_mana` : null, getManaBalanceFetcher(accountAddress, provider))

  return {
    mana: data,
    isLoading: !error && !data,
    isError: error
  }
}

const getTokenBalanceFetcher =
  (
    owner: string,
    contract: Contract
  ): (() => Promise<string>) =>
    async () => {
      const { result } = await contract.functions.balanceOf<{
        value: string;
      }>({
        owner,
      })

      return result?.value as string
    }

const getManaBalanceFetcher =
  (
    account: string,
    provider: Provider
  ): (() => Promise<string>) =>
    async () => {
      const mana = await provider.getAccountRc(account)

      return mana
    }

export function asFloat(value: string, decimals: number): number {
  if (!value) return 0
  return parseFloat(utils.formatUnits(value, decimals))
}