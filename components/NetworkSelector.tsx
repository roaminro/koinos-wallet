import { Menu, MenuButton, Button, MenuList, MenuOptionGroup, MenuItemOption, MenuDivider, MenuItem, Show, Hide } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FiChevronDown, FiGlobe } from 'react-icons/fi'
import { useNetworks } from '../context/NetworksProvider'

export function NetworkSelector() {
  const { t } = useTranslation()
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
          title={t('common:networks')}
          type='radio'
          value={selectedNetwork?.id}
        >
          {
            Object.keys(networks).map((networkId) => {
              const network = networks[networkId]
              return (
                <MenuItemOption
                  key={network.id}
                  onClick={() => selectNetwork(network)}
                  value={network.id}
                >
                  {network.name}
                </MenuItemOption>
              )
            })
          }
          <MenuDivider />
          <MenuItem onClick={() => router.push('/networks/add')}>{t('networkSelector:addNetwork')}</MenuItem>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}