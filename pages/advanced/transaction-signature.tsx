import { Button, Card, CardBody, CardHeader, Center, Divider, Stack, useToast, Heading, Text, FormControl, FormLabel, Textarea, Alert, AlertIcon, FormHelperText } from '@chakra-ui/react'
import { BackButton } from '../../components/BackButton'
import { ChangeEvent, MouseEvent, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { TransactionJson } from 'koilib/lib/interface'
import { useWallets } from '../../context/WalletsProvider'
import { useNetworks } from '../../context/NetworksProvider'
import { truncateAccount } from '../../util/Utils'

export default function TransactionSignature() {
  const { t } = useTranslation()
  const toast = useToast()

  const { signTransaction, selectedAccount } = useWallets()
  const { provider} = useNetworks()

  const [transactionString, setTransactionString] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTransactionStringChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTransactionString(e.target.value)
  }

  const handleSignClick = async (e: MouseEvent) => {
    try {
      setIsLoading(true)
      const transaction = JSON.parse(transactionString) as TransactionJson

      const signedTransaction = await signTransaction(selectedAccount!.account.public.address, transaction)

      setTransactionString(JSON.stringify(signedTransaction, null, 2))

      toast({
        title: t('transaction-signature:signSuccessToast.title'),
        description: t('transaction-signature:signSuccessToast.description'),
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: t('transaction-signature:signErrorToast.title'),
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendClick = async (e: MouseEvent) => {
    try {
      setIsLoading(true)
      const transaction = JSON.parse(transactionString) as TransactionJson

      const sentTransaction = await provider!.sendTransaction(transaction)

      await sentTransaction.transaction.wait()

      toast({
        title: t('transaction-signature:sendSuccessToast.title'),
        description: t('transaction-signature:sendSuccessToast.description'),
        status: 'success',
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: t('transaction-signature:sendErrorToast.title'),
        description: String(error),
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Stack spacing={8} direction='row'>
            <BackButton />
            <Heading size='md'>{t('transaction-signature:transaction_signature')}</Heading>
          </Stack>
          <br />
          <Text>Signing with account {selectedAccount?.account.public.name} ({truncateAccount(selectedAccount!.account.public.address)})</Text>
          <br />
          <Alert status='warning'>
            <AlertIcon />
            <Text>{t('transaction-signature:alert')}</Text>
          </Alert>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack>
            <FormControl>
              <FormLabel>{t('transaction-signature:transactionField.label')}</FormLabel>
              <FormHelperText>{t('transaction-signature:transactionField.helper')}</FormHelperText>
              <Textarea value={String(transactionString)} onChange={handleTransactionStringChange}  />
            </FormControl>
            <Button
              isLoading={isLoading}
              variant='solid'
              colorScheme='blue'
              onClick={handleSignClick}>
              {t('transaction-signature:sign')}
            </Button>
            <Button
              isLoading={isLoading}
              variant='solid'
              colorScheme='blue'
              onClick={handleSendClick}>
              {t('transaction-signature:send')}
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
