import {
  FiRepeat,
} from 'react-icons/fi'
import { Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Input, FormHelperText, Button, useToast, IconButton, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, InputGroup, InputRightElement, Tooltip } from '@chakra-ui/react'
import { Contract, Provider, utils } from 'koilib'
import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import SidebarWithHeader from '../../../components/Sidebar'
import { BackButton } from '../../../components/BackButton'
import { Network, useNetworks } from '../../../context/NetworksProvider'
import { useTokens } from '../../../context/TokensProvider'

export default function Edit() {
  const toast = useToast()
  const router = useRouter()
  const { networks } = useNetworks()
  const { updateToken, tokens } = useTokens()

  const { tokenAddress } = router.query

  const [isLoading, setIsLoading] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [network, setNetwork] = useState<Network>()
  const [tokenDecimals, setTokenDecimals] = useState(0)


  const handleTokenNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokenName(e.target.value)
  }

  const handleTokenSymbolChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokenSymbol(e.target.value)
  }

  const handleTokenDecimalsChange = (_: string, valueAsNumber: number) => {
    setTokenDecimals(valueAsNumber)
  }

  const fetchTokenInformation = async () => {
    try {
      const provider = new Provider(network?.rpcUrl!)

      const tokenContract = new Contract({
        id: tokenAddress as string,
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

      updateToken({
        chainId: network?.chainId!,
        address: tokenAddress as string,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals
      })

      router.push('/tokens')

      toast({
        title: 'Token successfully saved',
        description: 'The token was successfully saved!',
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occured while editing the token',
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tokenAddress) {
      const token = tokens.find((tkn) => tkn.address === tokenAddress)

      if (token) {
        setTokenName(token.name)
        setTokenSymbol(token.symbol)
        setTokenDecimals(token.decimals)

        const ntwrk = networks.find((net) => net.chainId === token.chainId)

        if (ntwrk) {
          setNetwork(ntwrk)
        }
      }
    }
  }, [tokenAddress, tokens, networks])

  if (!tokenAddress) return <></>

  return (
    <SidebarWithHeader>
      <Stack mt='6' spacing='3' align='center'>
        <Card maxW='sm'>
          <CardHeader>
            <Heading size='md'>
              <BackButton />
              Edit token
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Stack mt='6' spacing='3'>
              <FormControl isDisabled={true}>
                <FormLabel>Network</FormLabel>
                <Input value={network?.name} />
                <FormHelperText>Name of the network.</FormHelperText>
              </FormControl>

              <FormControl isDisabled={true}>
                <FormLabel>Token address</FormLabel>
                <InputGroup>
                  <Input value={tokenAddress} />
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
                variant='solid'
                colorScheme='green'
                onClick={handleBtnClick}>
                Save changes
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </SidebarWithHeader>
  )
}
