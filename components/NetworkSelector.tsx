import { Menu, MenuButton, Button, MenuList, MenuOptionGroup, MenuItemOption, MenuDivider, MenuItem, Show, Hide } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiChevronDown, FiGlobe } from 'react-icons/fi'
import { useNetworks } from '../context/NetworksProvider'

export function NetworkSelector() {
  const router = useRouter()

  const { selectedNetwork, networks, selectNetwork } = useNetworks()

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<FiChevronDown />}>
        <Hide below='md'>
          {selectedNetwork?.name}
        </Hide>
        <Show below='md'>
          <FiGlobe />
        </Show>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup
          title='Networks'
          type='radio'
          value={selectedNetwork?.chainId}
        >
          {
            networks.map((network) => (
              <MenuItemOption
                key={network.chainId}
                onClick={() => selectNetwork(network)}
                value={network.chainId}
              >
                {network.name}
              </MenuItemOption>
            ))
          }
          <MenuDivider />
          <MenuItem onClick={() => router.push('/networks')}>Add new network...</MenuItem>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}