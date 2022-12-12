import { Text, Button, ButtonGroup, Card, CardBody, useColorModeValue, CardHeader, Divider, Heading, Skeleton, Center, useToast, Alert, AlertIcon, FormControl, FormLabel, Textarea, FormHelperText, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stack, Box, useDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Messenger } from '../../util/Messenger'
import { useWallets } from '../../context/WalletsProvider'
import { Contract, Serializer, Signer, utils } from 'koilib'
import { OperationJson, SendTransactionOptions, TransactionJson, TransactionReceipt } from 'koilib/lib/interface'
import { useNetworks } from '../../context/NetworksProvider'
import { SignSendTransactionArguments, SignSendTransactionResult } from '../../wallet_connector_handlers/signerHandler'

export default function SignSendTransaction() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { wallets, signTransaction } = useWallets()
  const { provider, selectedNetwork, networks } = useNetworks()

  const [requester, setRequester] = useState('')
  const [signerAddress, setSignerAddress] = useState('')
  const [networkName, setNetworkName] = useState('')
  const [rcLimit, setRcLimit] = useState(0)
  const [send, setSend] = useState(false)
  const [transaction, setTransaction] = useState<TransactionJson>()
  const [transactionData, setTransactionData] = useState('')
  const [options, setOptions] = useState<SendTransactionOptions>()
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt>()

  const [messenger, setMessenger] = useState<Messenger<SignSendTransactionArguments, SignSendTransactionResult | null>>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [hasDecodingError, setHasDecodingError] = useState(false)

  useEffect(() => {
    const msgr = new Messenger<SignSendTransactionArguments, SignSendTransactionResult | null>(window.opener, 'sign-send-transaction-popup-child', true, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      await msgr.ping('sign-send-transaction-popup-parent')
      console.log('connected to parent iframe')
      const { requester, send, signerAddress, transaction, options } = await msgr.sendRequest('sign-send-transaction-popup-parent', null)

      setRequester(requester)
      setSend(send)
      setSignerAddress(signerAddress)
      setOptions(options)

      const { operations } = transaction

      if (operations) {
        if (!options.abis) {
          setTransactionData(JSON.stringify(operations, null, 2))
        } else {
          const decOperations: OperationJson[] = []

          for (let index = 0; index < operations.length; index++) {
            const operation = operations[index]

            if (!operation.call_contract || !operation.call_contract.contract_id) {
              decOperations.push(operation)
              continue
            }

            try {
              const contractId = operation.call_contract.contract_id
              const abi = options.abis[contractId]

              if (!abi || !abi.koilib_types) {
                throw new Error(`missing abi or koilib_types for contract ${contractId}`)
              }

              const contract = new Contract({
                id: contractId,
                abi,
                serializer: new Serializer(abi.koilib_types),
              })
              const { name, args } = await contract.decodeOperation(operation)

              if (!args) {
                throw new Error(`could not decode operation for contract ${contractId}`)
              }

              decOperations.push({
                //@ts-ignore we change the args in-place here
                call_contract: { contractId, name, args },
              })
            } catch (error) {
              console.error(error)
              decOperations.push(operation)
              setHasDecodingError(true)
            }
          }

          setTransactionData(JSON.stringify(decOperations, null, 2))
        }
      }

      // check if we need to prepare the transaction
      const tempTransaction = { ...transaction }
      if (!tempTransaction!.header) {
        tempTransaction!.header = {}
      }

      if (!tempTransaction!.header.payer) {
        tempTransaction!.header.payer = signerAddress
      }

      // check network
      if (selectedNetwork && !tempTransaction!.header.chain_id) {
        tempTransaction!.header.chain_id = selectedNetwork?.chainId
        setNetworkName(selectedNetwork.name)
      } else if (selectedNetwork && tempTransaction!.header.chain_id === selectedNetwork?.chainId) {
        setNetworkName(selectedNetwork.name)
      } else {
        for (let index = 0; index < networks.length; index++) {
          const network = networks[index]
          if (network.chainId === tempTransaction!.header.chain_id) {
            setNetworkName(network.name)
            break
          }
        }
      }

      // check rcLimit
      let rcLimit = tempTransaction!.header.rc_limit
      if (!rcLimit) {
        rcLimit = await provider?.getAccountRc(signerAddress)
      }
      if (rcLimit) {
        setRcLimit(parseFloat(utils.formatUnits(rcLimit!, selectedNetwork?.tokenDecimals!)))
      }

      setTransaction(tempTransaction)

      setIsLoading(false)
    }

    setupMessenger()


    return () => {
      msgr.removeListener()
    }
  }, [networks, provider, selectedNetwork])


  const handleRcLimitChange = (_: string, rcLimit: number) => {
    setRcLimit(rcLimit)
  }

  const onClickConfirm = async () => {
    setIsSigning(true)
    try {
      let tempTransaction = { ...transaction }
      tempTransaction.header!.rc_limit = utils.parseUnits(rcLimit.toString(), selectedNetwork?.tokenDecimals!)

      if (!tempTransaction?.header?.nonce
        || !tempTransaction?.header?.operation_merkle_root
        || !tempTransaction?.id
      ) {
        const dummySigner = Signer.fromSeed('dummy_signer')
        dummySigner.provider = provider

        tempTransaction = await dummySigner.prepareTransaction(tempTransaction)
      }

      const signedTransaction = await signTransaction(signerAddress, tempTransaction)

      if (!send) {
        messenger!.sendMessage('sign-send-transaction-popup-parent', {
          transaction: signedTransaction
        })
      } else {

        const { receipt } = await provider!.sendTransaction(signedTransaction)
        messenger!.sendMessage('sign-send-transaction-popup-parent', {
          transaction: signedTransaction,
          receipt
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while processing the transaction',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsSigning(false)
  }

  const onClickCheck = async () => {
    setIsSigning(true)
    try {
      let tempTransaction = { ...transaction }
      tempTransaction.header!.rc_limit = utils.parseUnits(rcLimit.toString(), selectedNetwork?.tokenDecimals!)

      if (!tempTransaction?.header?.nonce
        || !tempTransaction?.header?.operation_merkle_root
        || !tempTransaction?.id
      ) {
        const dummySigner = Signer.fromSeed('dummy_signer')
        dummySigner.provider = provider

        tempTransaction = await dummySigner.prepareTransaction(tempTransaction)
      }

      const signedTransaction = await signTransaction(signerAddress, tempTransaction)

      const { receipt } = await provider!.sendTransaction(signedTransaction, false)

      setTransactionReceipt(receipt)
      onOpen()
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while checking the transaction output',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
    setIsSigning(false)
  }

  const close = () => {
    self.close()
  }


  return (
    <Center>
      <Stack>
        <Card>
          <CardHeader>
            <Heading size='md'>Signature request</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Skeleton isLoaded={!isLoading}>
              <Stack>
                {
                  hasDecodingError && <Alert status='error'>
                    <AlertIcon />
                    Some of the operations could not be decoded, proceed with caution.
                  </Alert>
                }
                {
                  !networkName && <Alert status='error'>
                    <AlertIcon />
                    This transaction is for an unknown network.
                  </Alert>
                }
                <Text>
                  The website &quot;{requester}&quot; is requesting a signature.
                </Text>
                <Divider marginTop={4} marginBottom={4} />
                <FormControl>
                  <FormLabel>Network</FormLabel>
                  <Input value={networkName} isReadOnly={true} isDisabled={true} />
                  {
                    send
                      ? <FormHelperText>The network the transaction will be sent to.</FormHelperText>
                      : <FormHelperText>The network the transaction will be signed for.</FormHelperText>
                  }
                </FormControl>
                <FormControl>
                  <FormLabel>Signer address</FormLabel>
                  <Input value={signerAddress} isReadOnly={true} isDisabled={true} />
                  <FormHelperText>The address of the account being requested to sign the transaction.</FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Mana payer</FormLabel>
                  <Input value={transaction?.header?.payer} isReadOnly={true} isDisabled={true} />
                  <FormHelperText>The address of the account that will pay for the Mana.</FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Mana limit</FormLabel>
                  <NumberInput min={0} value={rcLimit} onChange={handleRcLimitChange}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Mana limit for the transaction.</FormHelperText>
                </FormControl>
                <FormControl isReadOnly={true}>
                  <FormLabel>Transaction data</FormLabel>
                  <Textarea value={transactionData} readOnly={true} />
                </FormControl>
              </Stack>
            </Skeleton>
          </CardBody>
        </Card>
        <Box
          style={{ position: 'sticky', bottom: 0, WebkitMaskPosition: 'sticky' }}
          bg={useColorModeValue('gray.100', 'gray.900')}
        >
          <Card>
            <CardBody>
              <ButtonGroup spacing='6' width='100%'>
                <Button onClick={close} colorScheme='red'>Cancel</Button>
                <Button width='40%' disabled={isLoading || !transaction} isLoading={isSigning} onClick={onClickCheck} colorScheme='blue'>
                  Check output
                </Button>
                <Button width='40%' disabled={isLoading || !transaction} isLoading={isSigning} onClick={onClickConfirm} colorScheme='green'>
                  {
                    send ? 'Send' : 'Sign'
                  }
                </Button>
              </ButtonGroup>
            </CardBody>
          </Card>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction output</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {
                transactionReceipt && (
                  <Card>
                    <CardBody>
                      <Stack>
                        <FormControl>
                          <FormLabel>Estimated mana cost</FormLabel>
                          <Input value={utils.formatUnits(transactionReceipt.rc_used, selectedNetwork?.tokenDecimals!)} isReadOnly={true} isDisabled={true} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Estimated compute bandwidth RC cost</FormLabel>
                          <Input value={transactionReceipt.compute_bandwidth_used} isReadOnly={true} isDisabled={true} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Estimated disk storage RC cost</FormLabel>
                          <Input value={transactionReceipt.disk_storage_used} isReadOnly={true} isDisabled={true} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Estimated network bandwidth RC cost</FormLabel>
                          <Input value={transactionReceipt.network_bandwidth_used} isReadOnly={true} isDisabled={true} />
                        </FormControl>
                        <FormControl isReadOnly={true}>
                          <FormLabel>TransactionLogs</FormLabel>
                          <Textarea value={JSON.stringify(transactionReceipt.logs, null, 2)} readOnly={true} />
                        </FormControl>
                        <FormControl isReadOnly={true}>
                          <FormLabel>Transaction events</FormLabel>
                          <Textarea value={JSON.stringify(transactionReceipt.events, null, 2)} readOnly={true} />
                        </FormControl>
                      </Stack>
                    </CardBody>
                  </Card>
                )
              }
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Center>
  )
}
