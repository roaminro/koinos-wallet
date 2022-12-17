import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Select, useToast, Link, Tooltip } from '@chakra-ui/react'
import { Contract, utils, Signer } from 'koilib'
import { ChangeEvent, useEffect, useState } from 'react'
import { useNetworks } from '../context/NetworksProvider'
import { useWallets } from '../context/WalletsProvider'
import { TransactionJson } from 'koilib/lib/interface'
import { getErrorMessage } from '../util/Utils'
import { useSWRConfig } from 'swr'
import { Token, useTokens } from '../context/TokensProvider'
import { useTokenBalance } from './BalanceUtils'

interface SendTokensModalProps {
  isOpen: boolean
  onClose: () => void
}


export default function SendTokensModal({ isOpen, onClose }: SendTokensModalProps) {
  const toast = useToast()
  const { mutate } = useSWRConfig()

  const { selectedAccount, signTransaction } = useWallets()
  const { selectedNetwork, provider } = useNetworks()
  const { tokens } = useTokens()

  const [amount, setAmount] = useState('0')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [availableTokens, setAvailableTokens] = useState<Record<string, Token>>()
  const [selectedToken, setSelectedToken] = useState<Token>()
  const [isSending, setIsSending] = useState(false)

  const handleRecipientAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value)
  }

  const handleAmountChange = (amount: string, _: number) => {
    setAmount(amount)
  }

  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (availableTokens) {
      setSelectedToken(availableTokens[event.target.value])
    }
  }


  useEffect(() => {
    if (tokens.length && selectedNetwork) {
      const tkns: Record<string, Token> = {}

      const initialToken: Token = {
        chainId: selectedNetwork.chainId,
        name: selectedNetwork.tokenName,
        address: selectedNetwork.tokenAddress,
        symbol: selectedNetwork.tokenSymbol,
        decimals: selectedNetwork.tokenDecimals,
      }

      tkns[initialToken.address] = initialToken

      for (const tokenAddress in tokens) {
        const token = tokens[tokenAddress]
        if (token.chainId === selectedNetwork.chainId) {
          tkns[token.address] = token
        }
      }

      setAvailableTokens({ ...tkns })

      setSelectedToken(initialToken)
    }
  }, [selectedNetwork, tokens])

  const sendTokens = async () => {
    setIsSending(true)
    try {
      if (selectedAccount && selectedToken && selectedNetwork) {
        const formattedAmount = utils.parseUnits(amount, selectedToken.decimals)

        const dummySigner = Signer.fromSeed('dummy_signer')
        dummySigner.provider = provider

        const tokenContract = new Contract({
          id: selectedToken.address,
          abi: utils.tokenAbi,
          provider,
          signer: dummySigner
        })

        // generate transaction
        const { transaction } = await tokenContract.functions.transfer({
          from: selectedAccount.account.public.address,
          to: recipientAddress,
          value: formattedAmount,
        }, {
          payer: selectedAccount.account.public.address,
          chainId: selectedNetwork.chainId,
          signTransaction: false,
          sendTransaction: false,
          broadcast: false,
          sendAbis: false,
        })

        // sign transaction
        const signedTx = await signTransaction(selectedAccount.account.public.address!, transaction as TransactionJson)

        // send transaction
        const sendResult = await provider?.sendTransaction(signedTx)

        await sendResult?.transaction.wait('byTransactionId', 60000)

        const cacheKey = `${selectedNetwork.chainId}_${selectedAccount?.account.public.address!}_history_undefined_10`
        mutate(cacheKey)

        toast({
          title: 'Tokens successfully sent',
          description: 'The tokens were successfully sent!',
          status: 'success',
          isClosable: true,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while sending the tokens',
        description: getErrorMessage(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsSending(false)
  }

  const { balance: tokenBalance, isLoading: isLoadingTokenBalance } = useTokenBalance(selectedAccount?.account?.public.address, selectedToken?.address)

  let formattedBalance = tokenBalance && selectedToken ? utils.formatUnits(tokenBalance, selectedToken.decimals) : ''

  let isRecipientAddressInvalid = false

  try {
    isRecipientAddressInvalid = !utils.isChecksumAddress(recipientAddress)
  } catch (error) {
    isRecipientAddressInvalid = true
  }

  const canSendTokens = !isRecipientAddressInvalid && !!selectedToken && parseFloat(amount) > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send tokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <FormControl>
            <FormLabel>Token</FormLabel>
            <Select
              value={selectedToken?.address}
              onChange={handleTokenChange}
            >
              {
                availableTokens && Object.keys(availableTokens).map((tknAddr) => (
                  <option key={tknAddr} value={tknAddr} >{availableTokens[tknAddr].name} ({availableTokens[tknAddr].symbol})</option>
                ))
              }
            </Select>
            <FormHelperText>Select the token to send.</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Sender</FormLabel>
            <Input value={selectedAccount?.account.public.address} isDisabled={true} isReadOnly={true} />
            <FormHelperText>The address of the sender.</FormHelperText>
          </FormControl>

          <FormControl isRequired isInvalid={isRecipientAddressInvalid}>
            <FormLabel>Recipient</FormLabel>
            <Input value={recipientAddress} onChange={handleRecipientAddressChange} />
            <FormHelperText>The address of the recipient.</FormHelperText>
            {
              isRecipientAddressInvalid && <FormErrorMessage>The recipient address entered is invalid.</FormErrorMessage>
            }
          </FormControl>

          <FormControl>
            <FormLabel>Amount</FormLabel>
            <NumberInput min={0} precision={selectedToken?.decimals} value={amount} onChange={handleAmountChange}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              <Tooltip
                label='set amount with balance'
                placement="bottom"
                hasArrow
              >
                <Link onClick={() => setAmount(formattedBalance)}>Balance: {formattedBalance}</Link>
              </Tooltip>
              <Text>Amount of tokens to send.</Text>
            </FormHelperText>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button isDisabled={!canSendTokens} isLoading={isSending} colorScheme='blue' onClick={sendTokens}>Send</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
