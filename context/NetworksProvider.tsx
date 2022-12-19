import { Provider } from 'koilib'
import { ReactNode, useContext, useState, createContext, useEffect } from 'react'
import appConfig from '../app.config'
import { NETWORKS_KEY, SELECTED_NETWORK_KEY } from '../util/Constants'

export type Network = {
  id?: string
  name: string
  chainId: string
  rpcUrl: string
  nameserviceAddress: string
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  tokenDecimals: number
  explorerUrl: string
}

type NetworksContextType = {
  networks: Record<string, Network>
  selectedNetwork?: Network
  provider?: Provider
  selectNetwork: (network: Network) => void
  addNetwork: (network: Network) => void
  updateNetwork: (network: Network) => void
  removeNetwork: (network: Network) => void
}

export const NetworksContext = createContext<NetworksContextType>({
  networks: appConfig.defaultNetworks,
  selectNetwork: (network: Network) => { },
  addNetwork: (network: Network) => { },
  updateNetwork: (network: Network) => { },
  removeNetwork: (network: Network) => { }
})

export const useNetworks = () => useContext(NetworksContext)

export const NetworksProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const [networks, setNetworks] = useState<Record<string, Network>>({})
  const [provider, setProvider] = useState<Provider>()
  const [selectedNetwork, setSelectedNetwork] = useState<Network>()

  useEffect(() => {
    const savedNetworks = localStorage.getItem(NETWORKS_KEY)

    if (savedNetworks) {
      setNetworks(JSON.parse(savedNetworks))
    } else {
      setNetworks(appConfig.defaultNetworks)
    }

    const savedSelectedNetwork = localStorage.getItem(SELECTED_NETWORK_KEY)

    if (savedSelectedNetwork) {
      const savedNetwork = JSON.parse(savedSelectedNetwork)
      setSelectedNetwork(savedNetwork)
      setProvider(new Provider(savedNetwork.rpcUrl))
    } else {
      const firstNetworkKey = Object.keys(appConfig.defaultNetworks)[0]
      const firstNetwork = (appConfig.defaultNetworks as Record<string, Network>)[firstNetworkKey]
      setSelectedNetwork(firstNetwork)
      setProvider(new Provider(firstNetwork.rpcUrl))
    }
  }, [])

  useEffect(() => {
    if (Object.keys(networks).length) {
      localStorage.setItem(NETWORKS_KEY, JSON.stringify(networks))
    }
  }, [networks])

  useEffect(() => {
    if (selectedNetwork) {
      localStorage.setItem(SELECTED_NETWORK_KEY, JSON.stringify(selectedNetwork))
    }
  }, [selectedNetwork])


  const selectNetwork = (network: Network) => {
    setSelectedNetwork(network)
    setProvider(new Provider(network.rpcUrl))
  }

  const addNetwork = (network: Network) => {
    const id = crypto.randomUUID()
    network.id = id
    setNetworks({ ...networks, [id]: network })
  }

  const removeNetwork = (network: Network) => {
    if (network.id && networks[network.id]) {
      delete networks[network.id]
      setNetworks({ ...networks })
    }
  }

  const updateNetwork = (network: Network) => {
    if (network.id && networks[network.id]) {
      networks[network.id] = network
      setNetworks({ ...networks })
    }
  }

  return (
    <NetworksContext.Provider value={{
      networks,
      selectedNetwork,
      provider,
      selectNetwork,
      addNetwork,
      updateNetwork,
      removeNetwork
    }}>
      {children}
    </NetworksContext.Provider>
  )
}