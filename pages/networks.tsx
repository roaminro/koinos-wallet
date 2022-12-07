import {
  FiTrash2,
  FiEdit,
  FiRepeat,
} from 'react-icons/fi'
import { Box, Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, CardFooter, Button, useToast, Table, TableContainer, Tbody, Td, Tr, IconButton, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useDisclosure, InputGroup, InputRightElement, Tooltip } from '@chakra-ui/react'
import { Contract, Provider, utils } from 'koilib'
import { ChangeEvent, useRef, useState } from 'react'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { Network, useNetworks } from '../context/NetworksProvider'

import { koinos } from '@koinos/proto-js'
import SidebarWithHeader from '../components/Sidebar'

export default function Networks() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { networks, removeNetwork, addNetwork, updateNetwork } = useNetworks()

  const [isLoading, setIsLoading] = useState(false)

  const confirmDialogRef = useRef(null)

  const [name, setName] = useState('')
  const [chainId, setChainId] = useState('')
  const [nameserviceAddress, setNameserviceAddress] = useState('')
  const [tokenName, setTokenName] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState(0)
  const [rpcUrl, setRpcUrl] = useState('')
  const [explorerUrl, setExplorerUrl] = useState('')
  const [networkChainIdToDelete, setChainIdToDelete] = useState<string | null>(null)

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleChainIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChainId(e.target.value)
  }

  const handleNameServiceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameserviceAddress(e.target.value)
  }

  const handleTokenNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokenName(e.target.value)
  }

  const handleTokenAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(e.target.value)
  }


  const handleTokenSymbolChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokenSymbol(e.target.value)
  }

  const handleTokenDecimalsChange = (_: string, valueAsNumber: number) => {
    setTokenDecimals(valueAsNumber)
  }

  const handleRpcUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRpcUrl(e.target.value)
  }

  const handleExplorerUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExplorerUrl(e.target.value)
  }

  const handleEditClick = (network: Network) => {
    setName(network.name)
    setChainId(network.chainId)
    setTokenName(network.tokenName)
    setTokenAddress(network.tokenAddress)
    setNameserviceAddress(network.nameserviceAddress)
    setTokenName(network.tokenName)
    setTokenSymbol(network.tokenSymbol)
    setTokenDecimals(network.tokenDecimals)
    setRpcUrl(network.rpcUrl)
    setExplorerUrl(network.explorerUrl)
  }

  const handleDeleteClick = (networkChainId: string) => {
    setChainIdToDelete(networkChainId)
    onOpen()
  }

  const fetchChainInformation = async () => {
    try {
      const provider = new Provider(rpcUrl)

      setChainId(await provider.getChainId())

      toast({
        title: 'Chain id successfully updated',
        description: 'The chain id was successfully updated!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while fetching the chain id',
        description: (error as Error).message,
        status: 'error',
        isClosable: true,
      })
    }
  }

  const fetchTokenInformation = async () => {
    try {
      const provider = new Provider(rpcUrl)

      // get the koin token address from the name service contract
      const args = koinos.contracts.name_service.get_address_arguments.create({
        name: 'koin'
      })

      const { result } = await provider.readContract({
        contract_id: nameserviceAddress,
        entry_point: 0xa61ae5e8,
        args: utils.encodeBase64url(koinos.contracts.name_service.get_address_arguments.encode(args).finish())
      })

      const { value } = koinos.contracts.name_service.get_address_result.decode(utils.decodeBase64url(result))

      if (value && value.address) {
        const koinAddress = utils.encodeBase58(value.address)
        setTokenAddress(koinAddress)

        const koinContract = new Contract({
          id: koinAddress,
          abi: utils.tokenAbi,
          provider
        })

        let result = await koinContract.functions.name()

        if (result.result) {
          setTokenName(result.result.value as string)
        }

        result = await koinContract.functions.symbol()

        if (result.result) {
          setTokenSymbol(result.result.value as string)
        }

        result = await koinContract.functions.decimals()

        if (result.result) {
          setTokenDecimals(parseInt(result.result.value as string))
        }

        toast({
          title: 'Token information successfully updated',
          description: 'The token information were successfully updated!',
          status: 'success',
          isClosable: true,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while fetching the token information',
        description: (error as Error).message,
        status: 'error',
        isClosable: true,
      })
    }
  }

  const isEditing = networks.some(network => network.chainId === chainId)

  const handleBtnClick = async () => {
    setIsLoading(true)

    try {

      if (isEditing) {
        updateNetwork({
          name,
          chainId,
          nameserviceAddress,
          tokenAddress,
          tokenName,
          tokenSymbol,
          tokenDecimals,
          rpcUrl,
          explorerUrl
        })

        toast({
          title: 'Network successfully updated',
          description: 'The network was successfully updated!',
          status: 'success',
          isClosable: true,
        })
      } else {
        addNetwork({
          name,
          chainId,
          nameserviceAddress,
          tokenAddress,
          tokenName,
          tokenSymbol,
          tokenDecimals,
          rpcUrl,
          explorerUrl
        })

        toast({
          title: 'Network successfully added',
          description: 'The network was successfully added!',
          status: 'success',
          isClosable: true,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while updating the network',
        description: (error as Error).message,
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarWithHeader>
      <Stack mt='6' spacing='3' align='center'>
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
              Networks
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <TableContainer>
              <Table variant='simple'>
                <Tbody>
                  {
                    networks.map((network) => (
                      <Tr
                        key={network.chainId}
                      >
                        <Td>{network.name}</Td>
                        <Td>
                          <IconButton
                            aria-label='Edit Network'
                            colorScheme='blue'
                            icon={<FiEdit />}
                            onClick={() => handleEditClick(network)} />
                          {' '}
                          <IconButton
                            aria-label='Delete Network'
                            colorScheme='red'
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteClick(network.chainId)} />
                        </Td>
                      </Tr>
                    ))
                  }
                </Tbody>
              </Table>
            </TableContainer>
            <ConfirmationDialog
              modalRef={confirmDialogRef}
              onClose={onClose}
              body='Are you sure you want to delete this network?'
              onAccept={() => {
                removeNetwork(networkChainIdToDelete!)
                setChainIdToDelete(null)
                toast({
                  title: 'Network successfully removed',
                  description: 'The network was successfully removed!',
                  status: 'success',
                  isClosable: true,
                })
              }}
              isOpen={isOpen}
            />
          </CardBody>
        </Card>
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
              Add/Edit networks
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={handleNameChange} />
                <FormHelperText>Name of the network.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>RPC url</FormLabel>
                <InputGroup>
                  <Input value={rpcUrl} onChange={handleRpcUrlChange} />
                  <InputRightElement>
                    <Tooltip label="Fetch chain id from rpc" aria-label='Fetch chain id from rpc'>
                      <IconButton
                        disabled={!rpcUrl}
                        aria-label='Fetch chain id from rpc'
                        icon={<FiRepeat />}
                        onClick={fetchChainInformation} />
                    </Tooltip>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>Url of the RPC server.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Chain id</FormLabel>
                <Input value={chainId} onChange={handleChainIdChange} />
                <FormHelperText>Chain id of the network. (you can only have 1 network with the same chain id setup)</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Name service address</FormLabel>
                <InputGroup>
                  <Input value={nameserviceAddress} onChange={handleNameServiceChange} />
                  <InputRightElement>
                    <Tooltip label="Fetch token information from rpc" aria-label='Fetch token information from rpc'>
                      <IconButton
                        disabled={!rpcUrl || !nameserviceAddress}
                        aria-label='Fetch token information from rpc'
                        icon={<FiRepeat />}
                        onClick={fetchTokenInformation} />
                    </Tooltip>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>Address of the name service.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Token address</FormLabel>
                <Input value={tokenAddress} onChange={handleTokenAddressChange} />
                <FormHelperText>Address of the native token.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Token name</FormLabel>
                <Input value={tokenName} onChange={handleTokenNameChange} />
                <FormHelperText>Name of the native token.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Token symbol</FormLabel>
                <Input value={tokenSymbol} onChange={handleTokenSymbolChange} />
                <FormHelperText>Symbol of the native token.</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Token decimals</FormLabel>
                <NumberInput step={1} min={0} value={tokenDecimals} onChange={handleTokenDecimalsChange}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Number of decimals for the native token.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Explorer url</FormLabel>
                <Input value={explorerUrl} onChange={handleExplorerUrlChange} />
                <FormHelperText>Url of the explorer.</FormHelperText>
              </FormControl>
              <Button
                isLoading={isLoading}
                variant='solid'
                colorScheme='green'
                onClick={handleBtnClick}>
                {
                  isEditing ? 'Save changes' : 'Add network'
                }
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </SidebarWithHeader>
  )
}
