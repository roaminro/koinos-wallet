import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Select, useToast } from '@chakra-ui/react'
import { Contract, utils, Signer } from 'koilib'
import { ChangeEvent, useEffect, useState } from 'react'
import { useNetworks } from '../context/NetworksProvider'
import { useWallets } from '../context/WalletsProvider'
import { TransactionJson } from 'koilib/lib/interface'

interface SendTokensModalProps {
  isOpen: boolean
  onClose: () => void
}

type Token = {
  address: string,
  name: string,
  symbol: string,
  decimals: number
}

export default function SendTokensModal({ isOpen, onClose }: SendTokensModalProps) {
  const toast = useToast()

  const { selectedAccount, signTransaction } = useWallets()
  const { selectedNetwork, provider } = useNetworks()

  const [amount, setAmount] = useState(0)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [tokens, setTokens] = useState<Record<string, Token>>()
  const [selectedToken, setSelectedToken] = useState<Token>()
  const [isSending, setIsSending] = useState(false)

  const handleRecipientAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value)
  }

  const handleAmountChange = (_: string, amount: number) => {
    setAmount(amount)
  }

  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (tokens) {
      setSelectedToken(tokens[event.target.value])
    }
  }


  useEffect(() => {
    if (selectedNetwork) {
      const initialToken = {
        name: selectedNetwork?.tokenName,
        address: selectedNetwork?.tokenAddress,
        symbol: selectedNetwork?.tokenSymbol,
        decimals: selectedNetwork?.tokenDecimals,
      }
      setTokens({
        [selectedNetwork.tokenAddress]: initialToken
      })

      setSelectedToken(initialToken)
    }
  }, [selectedNetwork])

  const sendTokens = async () => {
    setIsSending(true)
    try {
      if (selectedToken) {
        const formattedAmount = utils.parseUnits(amount.toString(), selectedToken.decimals)

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
          from: selectedAccount?.account.public.address,
          to: recipientAddress,
          value: formattedAmount,
        }, {
          payer: selectedAccount?.account.public.address,
          chainId: selectedNetwork?.chainId,
          signTransaction: false,
          sendTransaction: false,
          broadcast: false,
          sendAbis: false,
        })

        // sign transaction
        const signedTx = await signTransaction(selectedAccount?.account.public.address!, transaction as TransactionJson)


        // send transaction
        const sendResult = await provider?.sendTransaction(signedTx)
        await sendResult?.transaction.wait()

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
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsSending(false)
  }

  let isRecipientAddressInvalid = false

  try {
    isRecipientAddressInvalid = !utils.isChecksumAddress(recipientAddress)
  } catch (error) {
    isRecipientAddressInvalid = true
  }

  const canSendTokens = !isRecipientAddressInvalid && !!selectedToken && amount > 0

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
                tokens && Object.keys(tokens).map((tknAddr) => (
                  <option key={tknAddr} value={tknAddr} >{tokens[tknAddr].name} ({tokens[tknAddr].symbol})</option>
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
            <NumberInput min={0} value={amount} onChange={handleAmountChange}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>Amount of tokens to send.</FormHelperText>
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
