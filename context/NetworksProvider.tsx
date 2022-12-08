import { Provider } from 'koilib'
import { ReactNode, useContext, useState, createContext, useEffect } from 'react'
import appConfig from '../app.config'
import { NETWORKS_KEY, SELECTED_NETWORK_KEY } from '../util/Constants'

export type Network = {
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
  networks: Network[]
  selectedNetwork: Network
  provider?: Provider
  selectNetwork: (network: Network) => void
  addNetwork: (network: Network) => void
  updateNetwork: (network: Network) => void
  removeNetwork: (networkChainId: string) => void
}

export const NetworksContext = createContext<NetworksContextType>({
  networks: appConfig.defaultNetworks,
  selectedNetwork: appConfig.defaultNetworks[0],
  selectNetwork: (network: Network) => { },
  addNetwork: (network: Network) => { },
  updateNetwork: (network: Network) => { },
  removeNetwork: (networkChainId: string) => { }
})

export const useNetworks = () => useContext(NetworksContext)

export const NetworksProvider = ({
  children
}: {
  children: ReactNode;
}): JSX.Element => {

  const [networks, setNetworks] = useState<Network[]>(appConfig.defaultNetworks)
  const [provider, setProvider] = useState<Provider>()
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(appConfig.defaultNetworks[0])

  useEffect(() => {
    const savedNetworks = localStorage.getItem(NETWORKS_KEY)

    if (savedNetworks) {
      setNetworks(JSON.parse(savedNetworks))
    }

    const savedSelectedNetwork = localStorage.getItem(SELECTED_NETWORK_KEY)

    if (savedSelectedNetwork) {
      setSelectedNetwork(JSON.parse(savedSelectedNetwork))
    }
  }, [])

  useEffect(() => {
    if (networks.length) {
      localStorage.setItem(NETWORKS_KEY, JSON.stringify(networks))
    }
  }, [networks])

  useEffect(() => {
    if (selectedNetwork) {
      localStorage.setItem(SELECTED_NETWORK_KEY, JSON.stringify(selectedNetwork))
      setProvider(new Provider(selectedNetwork.rpcUrl))
    }
  }, [selectedNetwork])


  const selectNetwork = (network: Network) => {
    setSelectedNetwork(network)
  }

  const addNetwork = (network: Network) => {
    setNetworks([...networks, network])
  }

  const removeNetwork = (networkchainId: string) => {
    setNetworks([...networks.filter((network) => network.chainId !== networkchainId)])
  }

  const updateNetwork = (network: Network) => {
    for (let index = 0; index < networks.length; index++) {
      if (networks[index].chainId === network.chainId) {
        networks[index] = network
        break
      }
    }

    setNetworks([...networks])
  }

  return (
    <NetworksContext.Provider value={{
      networks,
      selectedNetwork,
      selectNetwork,
      addNetwork,
      updateNetwork,
      removeNetwork
    }}>
      {children}
    </NetworksContext.Provider>
  )
}