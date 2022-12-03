import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Heading,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon, LockIcon } from '@chakra-ui/icons'

import { useWallets } from '../context/WalletsProvider'


export default function Nav() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { lock, isLocked } = useWallets()

  return (
    <>
      <Box bg={useColorModeValue('gray.300', 'gray.700')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Heading as='h3' size='md'>
            Wallet
          </Heading>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
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