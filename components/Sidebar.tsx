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
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  VStack,
  Stack,
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
  FiGithub,
  FiFileText,
  FiSettings,
  FiMap,
  FiBook
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import useTranslation from 'next-translate/useTranslation'
import { useWallets } from '../context/WalletsProvider'
import { NetworkSelector } from './NetworkSelector'
import Logo from './Logo'

interface LinkItemProps {
  name: string
  href?: string
  icon: IconType
  showWhenLocked?: boolean
  hideWhenVaultNotSetup?: boolean
  children?: Array<LinkItemProps>
}

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
  const { t } = useTranslation()
  const { isVaultSetup, isLocked } = useWallets()
  const { publicRuntimeConfig } = getConfig()

  const LinkItems: Array<LinkItemProps> = [
    { name: t('common:home'), icon: FiHome, href: '/home', hideWhenVaultNotSetup: true },
    { name: t('common:contacts'), icon: FiBook, href: '/contacts', hideWhenVaultNotSetup: true },
    {
      name: t('common:settings'), icon: FiSettings, showWhenLocked: true,
      children: [
        { name: t('common:tokens'), icon: FiDatabase, href: '/tokens', hideWhenVaultNotSetup: true },
        { name: t('common:wallets'), icon: FiCreditCard, href: '/wallets', hideWhenVaultNotSetup: true },
        { name: t('common:permissions'), icon: FiFileText, href: '/permissions', hideWhenVaultNotSetup: true },
        { name: t('common:networks'), icon: FiGlobe, href: '/networks', hideWhenVaultNotSetup: true },
        { name: t('common:backup'), icon: FiHardDrive, href: '/backup', showWhenLocked: true },
        { name: t('common:language'), icon: FiMap, href: '/language' },
      ]
    },
  ]

  return (
    <Box
      overflow='auto'
      transition="3s ease"
      bg={useColorModeValue('gray.300', 'gray.700')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Stack height='100%' justifyContent='space-between'>
        <Box>
          <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
            <Logo display='flex' size='40px' />
            <Link href='/home'>
              <Text fontSize={['sm', 'md', 'md', 'md']} fontWeight="bold">
                {t('common:appName')}
              </Text>
            </Link>
            <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
          </Flex>
          <Accordion allowMultiple>
            {LinkItems.map((link, id) => (
              ((!isVaultSetup && !link.hideWhenVaultNotSetup) || (isVaultSetup && !isLocked) || (isLocked && link.showWhenLocked)) &&
              <AccordionItem key={id}>
                <AccordionButton>
                  {
                    !link.children ?
                      <NavItem
                        href={link.href!}
                        icon={link.icon}
                        onClick={onClose}
                      >
                        {link.name}
                      </NavItem>
                      :
                      <HStack
                        p="4"
                        mx="4"
                      >
                        <HStack>
                          <Icon as={link.icon} />
                          <Text >{link.name}</Text>
                        </HStack>
                        <AccordionIcon />
                      </HStack>
                  }
                </AccordionButton>
                {
                  link.children &&
                  <AccordionPanel>
                    {
                      link.children.map((childLink, cId) => (
                        ((!isVaultSetup && !childLink.hideWhenVaultNotSetup) || (isVaultSetup && !isLocked) || (isLocked && childLink.showWhenLocked)) &&
                        <NavItem key={cId} href={childLink.href!} icon={childLink.icon} onClick={onClose}>
                          {childLink.name}
                        </NavItem>
                      ))
                    }
                  </AccordionPanel>
                }
              </AccordionItem>
            ))}
          </Accordion>
          <Alert status='info'>
            <AlertIcon />
            <Link style={{ overflow: 'auto' }} target='_blank' href='https://github.com/roaminro/roaminro'>
              {t('sidebar:message')} https://github.com/roaminro
            </Link>
          </Alert>
        </Box>
        <HStack
          // position='absolute' bottom='0px'
          justify='center' width='100%'>
          <Text fontSize='xs'>{t('sidebar:graphicsBy')}</Text>
          <Link target='_blank' href='https://github.com/roaminro/my-koinos-wallet'>
            <FiGithub />
          </Link>
          <Link target='_blank' href='https://github.com/roaminro/my-koinos-wallet'>
            <Text fontSize='xs'>v{publicRuntimeConfig.version}</Text>
          </Link>
        </HStack>
      </Stack>
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
    <Box width='100%'>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <Flex
          width='100%'
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
          <Text>{children}</Text>
        </Flex>
      </Link>
    </Box>
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