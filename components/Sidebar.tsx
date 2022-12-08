import React, { ReactNode } from 'react'
import Link from 'next/link'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Button,
  useColorMode,
  MenuOptionGroup,
  MenuItemOption,
} from '@chakra-ui/react'
import {
  FiHome,
  FiMenu,
  FiChevronDown,
  FiLock,
  FiMoon,
  FiSun,
  FiCreditCard,
  FiGlobe,
  FiHardDrive
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useRouter } from 'next/router'
import { useNetworks } from '../context/NetworksProvider'
import { useWallets } from '../context/WalletsProvider'

interface LinkItemProps {
  name: string
  href: string
  icon: IconType
  hideWhenVaultNotSetup?: boolean
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, href: '/dashboard', hideWhenVaultNotSetup: true },
  { name: 'Wallets', icon: FiCreditCard, href: '/wallets', hideWhenVaultNotSetup: true },
  { name: 'Networks', icon: FiGlobe, href: '/networks' },
  { name: 'Vault', icon: FiHardDrive, href: '/vault' },
]

export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { isVaultSetup } = useWallets()

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('gray.300', 'gray.700')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Wallet
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        ((!isVaultSetup && !link.hideWhenVaultNotSetup) || isVaultSetup) &&
        <NavItem key={link.name} href={link.href} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  href: string
  children: string;
}
const NavItem = ({ icon, href, children, ...rest }: NavItemProps) => {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: useColorModeValue('gray.400', 'gray.600'),
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const router = useRouter()
  const { colorMode, toggleColorMode } = useColorMode()

  const { lock, isLocked } = useWallets()
  const { selectedNetwork, networks, selectNetwork } = useNetworks()

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="16"
      alignItems="center"
      bg={useColorModeValue('gray.300', 'gray.700')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontWeight="bold">
        Wallet
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <Menu>
          <MenuButton as={Button} rightIcon={<FiChevronDown />}>
            {selectedNetwork.name}
          </MenuButton>
          <MenuList>
            <MenuOptionGroup 
            title='Networks' 
            type='radio' 
            value={selectedNetwork.chainId}
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
        {
          !isLocked &&
          <Button onClick={lock}>
            <FiLock />
          </Button>
        }
        <Button onClick={toggleColorMode}>
          {colorMode === 'light' ? <FiMoon /> : <FiSun />}
        </Button>
      </HStack>
    </Flex>
  )
}