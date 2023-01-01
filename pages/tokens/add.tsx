import {
  FiRepeat,
} from 'react-icons/fi'
import { Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, FormErrorMessage, Button, useToast, IconButton, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, InputGroup, InputRightElement, Tooltip, Center } from '@chakra-ui/react'
import { Contract, Provider, utils } from 'koilib'
import { ChangeEvent, useState } from 'react'

import { BackButton } from '../../components/BackButton'
import { useNetworks } from '../../context/NetworksProvider'
import { useTokens } from '../../context/TokensProvider'
import { useRouter } from 'next/router'

export default function Add() {
  const router = useRouter()
  const toast = useToast()
  const { selectedNetwork } = useNetworks()
  const { tokens, addToken } = useTokens()

  const [isLoading, setIsLoading] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState(0)


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

  const fetchTokenInformation = async () => {
    try {
      const provider = new Provider(selectedNetwork?.rpcUrl!)

      const tokenContract = new Contract({
        id: tokenAddress,
        abi: utils.tokenAbi,
        provider
      })

      let result = await tokenContract.functions.name()

      if (result.result) {
        setTokenName(result.result.value as string)
      }

      result = await tokenContract.functions.symbol()

      if (result.result) {
        setTokenSymbol(result.result.value as string)
      }

      result = await tokenContract.functions.decimals()

      if (result.result) {
        setTokenDecimals(parseInt(result.result.value as string))
      }

      toast({
        title: 'Token information successfully updated',
        description: 'The token information were successfully updated!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while fetching the token information',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    }
  }

  const handleBtnClick = async () => {
    setIsLoading(true)

    try {

      addToken({
        chainId: selectedNetwork?.chainId!,
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals
      })

      router.push('/tokens')

      toast({
        title: 'Token successfully added',
        description: 'The token was successfully added!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while adding the token',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cannotAddToken = tokens[tokenAddress] !== undefined


  return (
    <Center>
      <Card>
        <CardHeader>
          <Heading size='md'>
            <BackButton />
            Add token
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack mt='6' spacing='3'>
            <FormControl isDisabled={true}>
              <FormLabel>Network</FormLabel>
              <Input value={selectedNetwork?.name} />
              <FormHelperText>Name of the network.</FormHelperText>
            </FormControl>

            <FormControl isRequired isInvalid={cannotAddToken}>
              <FormLabel>Token address</FormLabel>
              <InputGroup>
                <Input value={tokenAddress} onChange={handleTokenAddressChange} />
                <InputRightElement>
                  <Tooltip label="Fetch token information" aria-label='Fetch token information from rpc'>
                    <IconButton
                      disabled={!tokenAddress}
                      aria-label='Fetch token information from rpc'
                      icon={<FiRepeat />}
                      onClick={fetchTokenInformation} />
                  </Tooltip>
                </InputRightElement>
              </InputGroup>
              <FormHelperText>Address of the token.</FormHelperText>
              {
                cannotAddToken && <FormErrorMessage>There is already another token with the same address.</FormErrorMessage>
              }
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={tokenName} onChange={handleTokenNameChange} />
              <FormHelperText>Name of the token.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Symbol</FormLabel>
              <Input value={tokenSymbol} onChange={handleTokenSymbolChange} />
              <FormHelperText>Symbol of the token.</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Decimals</FormLabel>
              <NumberInput step={1} min={0} value={tokenDecimals} onChange={handleTokenDecimalsChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Number of decimals for the token.</FormHelperText>
            </FormControl>
            <Button
              isLoading={isLoading}
              isDisabled={cannotAddToken}
              variant='solid'
              colorScheme='green'
              onClick={handleBtnClick}>
              Add token
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
