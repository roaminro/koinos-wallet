import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Heading,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon, LockIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/router'

import { useWallets } from '../context/WalletsProvider'
import { useNetworks } from '../context/NetworksProvider'


export default function Nav() {
  const router = useRouter()
  const { colorMode, toggleColorMode } = useColorMode()

  const { lock, isLocked } = useWallets()
  const { selectedNetwork, networks, selectNetwork } = useNetworks()

  return (
    <>
      <Box bg={useColorModeValue('gray.300', 'gray.700')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Heading as='h3' size='md'>
            Wallet
          </Heading>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Menu>
                <MenuButton as={Button} >
                  {selectedNetwork.name} <ChevronDownIcon />
                </MenuButton>
                <MenuList>
                  {
                    networks.map((network) => (
                      <MenuItem 
                      key={network.chainId}
                      onClick={() => selectNetwork(network)}
                      >
                        {network.name}
                      </MenuItem>
                    ))
                  }
                  <MenuDivider />
                  <MenuItem onClick={() => router.push('/networks')}>Add new network...</MenuItem>
                </MenuList>
              </Menu>
              {
                !isLocked &&
                <Button onClick={lock}>
                  <LockIcon />
                </Button>
              }
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}