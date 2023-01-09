import { FiClipboard, FiSend } from 'react-icons/fi'
import { Box, Card, CardBody, CardHeader, Center, Divider, HStack, IconButton, Skeleton, Stat, StatHelpText, StatNumber, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useClipboard, useToast, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { useWallets } from '../context/WalletsProvider'
import { truncateAccount } from '../util/Utils'
import { asFloat, useManaBalance, useTokenBalance } from '../components/BalanceUtils'
import { useNetworks } from '../context/NetworksProvider'
import SendTokensModal from '../components/SendTokensModal'
import { AccountHistory } from '../components/AccountHistory'
import { TokensPanel } from '../components/TokensPanel'
import { GroupBase, Select, SingleValue } from 'chakra-react-select'
import { Account } from '../util/Vault'
import ManaOrb from '../components/ManaOrb'

interface AccountOption {
  walletId: string
  walletName: string
  account: Account
}

export default function Home() {
  const { wallets, selectedAccount, selectAccount } = useWallets()
  const { selectedNetwork } = useNetworks()
  const { onCopy, setValue: setClipoard } = useClipboard('')
  const toast = useToast()

  const [account, setAccount] = useState<AccountOption | null>()

  const { balance: koinBalance, isLoading: isLoadingKoinBalance } = useTokenBalance(selectedAccount?.account?.public.address, selectedNetwork?.tokenAddress)
  const { mana, isLoading: isLoadingManaBalance } = useManaBalance(selectedAccount?.account?.public.address)

  useEffect(() => {
    if (!selectedAccount) {
      const walletIds = Object.keys(wallets)

      if (walletIds.length) {
        const walletId = walletIds[0]
        const accountIds = Object.keys(wallets[walletId].accounts)
        if (accountIds.length) {
          const account = wallets[walletId].accounts[accountIds[0]]
          selectAccount(walletId, wallets[walletId].name, account)
        }
      }
    }
  }, [wallets, selectedAccount, selectAccount])


  useEffect(() => {
    if (selectedAccount) {
      setClipoard(selectedAccount.account.public.address)
      setAccount({
        walletId: selectedAccount.walletId,
        walletName: selectedAccount.walletName,
        account: selectedAccount.account
      })
    }
  }, [selectedAccount, setClipoard])

  const onCopyAddress = () => {
    onCopy()

    toast({
      title: 'Address successfully copied',
      description: 'The account address was successfully copied!',
      status: 'success',
      isClosable: true,
    })
  }

  const handleAccountChange = (accountOption: SingleValue<AccountOption>) => {
    setAccount(accountOption)
    if (accountOption) {
      selectAccount(accountOption.walletId, accountOption.walletName, accountOption.account)
    }
  }

  const openSendTokensModal = (defaultTokenAddress: string) => {
    NiceModal.show(SendTokensModal, { defaultTokenAddress })
  }

  const accountOptions: GroupBase<AccountOption>[] = []

  Object.entries(wallets).map(([walletId, wallet]) => {
    const walletOption: { label: string, options: AccountOption[] } = {
      label: wallet.name,
      options: []
    }

    Object.entries(wallet.accounts).map(([_, account]) => {
      walletOption.options.push({
        walletId,
        walletName: wallet.name,
        account
      })
    })

    accountOptions.push(walletOption)
  })

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <VStack>
            <HStack>
              <Box minWidth='200px'>
                <Select<AccountOption, false, GroupBase<AccountOption>>
                  variant="filled"
                  useBasicStyles
                  selectedOptionStyle="check"
                  options={accountOptions}
                  placeholder="Select account..."
                  closeMenuOnSelect={true}
                  getOptionLabel={(accountOption: AccountOption) => `${accountOption.account.public.name} (${truncateAccount(accountOption.account.public.address)})`}
                  getOptionValue={(accountOption: AccountOption) => accountOption.account.public.id}
                  value={account}
                  onChange={handleAccountChange}
                />
              </Box>
              <Tooltip
                label={`copy to clipboard ${selectedAccount?.account.public.address}`}
                placement="bottom"
                hasArrow
              >
                <IconButton size={'sm'} aria-label='copy address' icon={<FiClipboard />} onClick={onCopyAddress} />
              </Tooltip>
            </HStack>
            {
              <HStack>
                <Stat>
                  <Skeleton isLoaded={!isLoadingKoinBalance}>
                    <StatNumber>{`${asFloat(koinBalance!, selectedNetwork?.tokenDecimals!)} ${selectedNetwork?.tokenSymbol}`}</StatNumber>
                  </Skeleton>
                  <Skeleton isLoaded={!isLoadingManaBalance}>
                    <StatHelpText>{asFloat(mana!, selectedNetwork?.tokenDecimals!)} mana </StatHelpText>
                  </Skeleton>
                </Stat>
                <ManaOrb
                  percent={asFloat(mana!, selectedNetwork?.tokenDecimals!) / asFloat(koinBalance!, selectedNetwork?.tokenDecimals!)}
                />
              </HStack>
            }
            <Tooltip
              label="send tokens"
              placement="bottom"
              hasArrow
            >
              <IconButton bg='brand.blue' aria-label='send tokens' icon={<FiSend />} onClick={() => openSendTokensModal(selectedNetwork?.tokenAddress!)} />
            </Tooltip>
          </VStack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs isLazy>
            <TabList>
              <Tab>Tokens</Tab>
              <Tab>Activity</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <TokensPanel />
              </TabPanel>
              <TabPanel>
                <AccountHistory />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Center>
  )
}
