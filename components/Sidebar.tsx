import React, { ReactNode } from 'react'
import Link from 'next/link'
import getConfig from 'next/config'
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
  Button,
  useColorMode,
  Hide,
  AlertIcon,
  Alert,
} from '@chakra-ui/react'
import {
  FiHome,
  FiMenu,
  FiLock,
  FiMoon,
  FiSun,
  FiCreditCard,
  FiGlobe,
  FiHardDrive,
  FiDatabase,
  FiGithub
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useWallets } from '../context/WalletsProvider'
import { NetworkSelector } from './NetworkSelector'
import Logo from './Logo'

interface LinkItemProps {
  name: string
  href: string
  icon: IconType
  hideWhenVaultNotSetup?: boolean
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome, href: '/home', hideWhenVaultNotSetup: true },
  { name: 'Tokens', icon: FiDatabase, href: '/tokens', hideWhenVaultNotSetup: true },
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
  const { publicRuntimeConfig } = getConfig()

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
        <Logo display='flex' size='40px' />
        <Link href='/home'>
          <Text fontSize={['sm', 'md', 'md', 'md']} fontWeight="bold">
            My Koinos Wallet
          </Text>
        </Link>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        ((!isVaultSetup && !link.hideWhenVaultNotSetup) || isVaultSetup) &&
        <NavItem key={link.name} href={link.href} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
      <Alert status='warning'>
        <AlertIcon />
        My Koinos Wallet is still a work in progress and breaking changes may happen. Make sure to export your Vault everytime you create a new wallet.
      </Alert>
      <HStack position='absolute' bottom='0px' justify='center' width='100%'>
        <Text fontSize='xs'>Graphics by Karlos</Text>
        <Link target='_blank' href='https://github.com/roaminro/my-koinos-wallet'>
          <FiGithub />
        </Link>
        <Link target='_blank' href='https://github.com/roaminro/my-koinos-wallet'>
          <Text fontSize='xs'>v{publicRuntimeConfig.version}</Text>
        </Link>
      </HStack>
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
  const { colorMode, toggleColorMode } = useColorMode()

  const { lock, isLocked } = useWallets()

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
      <Box>
        <HStack>
          <Hide above='md'>
            <Link href='/home'>
              <Logo display={{ base: 'flex', md: 'none' }} size='40px' />
            </Link>
          </Hide>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
          />
        </HStack>
      </Box>

      <HStack spacing={{ base: '0', md: '6' }}>
        <NetworkSelector />
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
    </Flex >
  )
}