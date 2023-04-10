import { Link, Stack, Skeleton, Card, CardBody, VStack, Text, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Tooltip } from '@chakra-ui/react'
import { Serializer, utils } from 'koilib'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiCpu, FiDownload, FiExternalLink, FiPlus, FiSend, FiTrash2, FiUpload } from 'react-icons/fi'
import { useNetworks } from '../context/NetworksProvider'
import { useTokens } from '../context/TokensProvider'
import { useWallets } from '../context/WalletsProvider'
import { truncateAccount, truncateTransactionId } from '../util/Utils'
import { useAccountHistory } from './AccountHistoryUtils'

const TOKEN_ENTRY_POINTS: Record<number, string> = {
  0x27f576ca: 'transfer',
  0xdc6f17bb: 'mint',
  0x859facc5: 'burn'
}

interface ParsedTransaction {
  id: string
  manaUsed?: string
  operations: {
    type: string
    contractId: string
    from?: string
    to?: string
    amount?: string
    memo?: string
  }[]
}

export function AccountHistory() {
  const { t } = useTranslation()
  const { selectedAccount } = useWallets()
  const { selectedNetwork } = useNetworks()
  const { tokens } = useTokens()

  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [seqNum, setSeqNum] = useState<string>()
  const [limit, setLimit] = useState(10)

  const { transactions, isLoading: isLoadingAccountHistory } = useAccountHistory(selectedAccount?.account?.public.address, limit, seqNum)

  // @ts-ignore adding optional "memo" field to transfer_arguments
  utils.tokenAbi.koilib_types!.nested.koinos.nested.contracts.nested.token.nested.transfer_arguments.fields.memo = {
    'type': 'string',
      'id': 100
  }

  const serializer = useRef(new Serializer(utils.tokenAbi.koilib_types!))

  useEffect(() => {
    if (!isLoadingAccountHistory && transactions) {
      const parseTransactions = async () => {
        const parsedTxs: ParsedTransaction[] = []

        for (let index = 0; index < transactions.length; index++) {
          const historyTx = transactions[index]

          if (historyTx.trx) {
            const manaUsed = historyTx.trx.transaction.header?.payer === selectedAccount?.account.public.address ? historyTx.trx.receipt.rc_used : undefined

            const parsedTx: ParsedTransaction = {
              id: historyTx.trx.transaction.id!,
              manaUsed,
              operations: []
            }

            if (historyTx.trx.transaction.operations) {
              for (let opIdx = 0; opIdx < historyTx.trx.transaction.operations.length; opIdx++) {
                const op = historyTx.trx.transaction.operations[opIdx]

                if (op.call_contract) {
                  const methodName = TOKEN_ENTRY_POINTS[op.call_contract.entry_point]
                  if (methodName) {
                    const args = await serializer.current.deserialize(op.call_contract.args, `${methodName}_arguments`)

                    switch (methodName) {
                      case 'transfer': {
                        let type = t('accountHistory:received')
                        if (selectedAccount?.account.public.address === args.from) {
                          type = t('accountHistory:sent')
                        }
                        parsedTx.operations.push({
                          type,
                          contractId: op.call_contract.contract_id!,
                          from: args.from as string,
                          to: args.to as string,
                          amount: args.value as string || '0',
                          memo: args.memo as string | undefined
                        })
                        break
                      }
                      case 'burn': {
                        let type = t('accountHistory:burned')
                        parsedTx.operations.push({
                          type,
                          contractId: op.call_contract.contract_id!,
                          from: args.from as string,
                          amount: args.value as string
                        })
                        break
                      }
                      case 'mint': {
                        let type = t('accountHistory:minted')
                        parsedTx.operations.push({
                          type,
                          contractId: op.call_contract.contract_id!,
                          to: args.to as string,
                          amount: args.value as string
                        })
                        break
                      }
                    }
                  } else {
                    parsedTx.operations.push({
                      type: t('accountHistory:contractInteraction'),
                      contractId: op.call_contract.contract_id!
                    })
                  }
                } else if (op.upload_contract) {
                  parsedTx.operations.push({
                    type: t('accountHistory:contractUpload'),
                    contractId: op.upload_contract.contract_id!
                  })
                }
              }
            }

            parsedTxs.push(parsedTx)
          }
        }

        setParsedTransactions([...parsedTxs])
      }

      parseTransactions()
    }
  }, [isLoadingAccountHistory, selectedAccount?.account.public.address, t, transactions])

  const loadNext = () => {
    if (transactions?.length) {
      let sequenceNumber = transactions[0].seq_num || '0'
      if (sequenceNumber) {
        sequenceNumber = `${parseInt(sequenceNumber) + limit}`
      }
      setSeqNum(sequenceNumber)
    } else {
      setSeqNum(undefined)
    }
  }

  const loadPrevious = () => {
    if (transactions?.length) {
      let sequenceNumber = transactions[transactions.length - 1].seq_num
      if (sequenceNumber) {
        sequenceNumber = `${parseInt(sequenceNumber) - 1}`
      }
      setSeqNum(sequenceNumber)
    } else {
      setSeqNum(undefined)
    }
  }

  const handleLimitChange = (_: string, newLimit: number) => {
    setLimit(newLimit)
  }

  const isPreviousDisabled = transactions === undefined || (transactions.length > 0 && !transactions[transactions.length - 1].seq_num)
  const isNextDisabled = transactions && transactions.length === 0

  return (
    <Skeleton isLoaded={!isLoadingAccountHistory}>
      <VStack>
        <Stack direction='row' spacing={4}>
          <Button size='xs' leftIcon={<FiArrowLeft />} isDisabled={isNextDisabled} onClick={loadNext}>
            {t('common:next')}
          </Button>
          <Tooltip
            label={t('accountHistory:numberRecordsPerPage')}
            placement="bottom"
            hasArrow
          >
            <NumberInput
              width='60px'
              size='xs'
              min={5}
              max={50}
              step={5}
              value={limit}
              onChange={handleLimitChange}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Tooltip>
          <Button size='xs' rightIcon={<FiArrowRight />} isDisabled={isPreviousDisabled} onClick={loadPrevious}>
            {t('common:previous')}
          </Button>
        </Stack>
        {
          !parsedTransactions.length && <Text>{t('accountHistory:noActivityFound')}</Text>
        }
        {
          parsedTransactions?.map(parsedTx => {
            return (
              <Card variant='outline' key={parsedTx.id} width='100%'>
                <CardBody>
                  <Link href={`${selectedNetwork?.explorerUrl}/tx/${parsedTx.id}`} isExternal>
                    {truncateTransactionId(parsedTx.id!)} <FiExternalLink style={{ display: 'inline-block' }} />
                  </Link>
                  {
                    parsedTx.manaUsed && <Text fontSize='xs'>
                      {t('accountHistory:manaUsed')} {utils.formatUnits(parsedTx.manaUsed, selectedNetwork?.tokenDecimals!)}
                    </Text>
                  }
                  {
                    parsedTx.operations.map((op, opIdx) => {
                      let symbol = ''
                      let amount = ''
                      if (op.contractId === selectedNetwork?.tokenAddress) {
                        symbol = selectedNetwork.tokenSymbol
                        amount = utils.formatUnits(op.amount!, selectedNetwork.tokenDecimals)
                      } else if (tokens[op.contractId]) {
                        symbol = tokens[op.contractId].symbol
                        amount = utils.formatUnits(op.amount!, tokens[op.contractId].decimals)
                      } else if (op.amount) {
                        symbol = op.contractId
                        amount = `${op.amount} ${t('accountHistory:unparsedAMount')}`
                      }

                      switch (op.type) {
                        case t('accountHistory:sent'): {
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text>
                                  <FiSend style={{ display: 'inline-block' }} /> {t('accountHistory:sentMessage', { amount, symbol })}
                                  {' '}
                                  <Link href={`${selectedNetwork?.explorerUrl}/address/${op.to}`} isExternal>
                                    {truncateAccount(op.to!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                  </Link>
                                </Text>
                                {
                                  op.memo ? <Text>Memo: {op.memo}</Text> : null
                                }
                              </CardBody>
                            </Card>
                          )
                        }

                        case t('accountHistory:received'): {
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text>
                                  <FiDownload style={{ display: 'inline-block' }} /> {t('accountHistory:receivedMessage', { amount, symbol })}
                                  {' '}
                                  <Link href={`${selectedNetwork?.explorerUrl}/address/${op.from}`} isExternal>
                                    {truncateAccount(op.from!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                  </Link>
                                </Text>
                                {
                                  op.memo ? <Text>Memo: {op.memo}</Text> : null
                                }
                              </CardBody>
                            </Card>
                          )
                        }

                        case t('accountHistory:minted'): {
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text><FiPlus style={{ display: 'inline-block' }} />{t('accountHistory:mintedMessage', { amount, symbol })}</Text>
                              </CardBody>
                            </Card>
                          )
                        }

                        case t('accountHistory:burned'): {
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text><FiTrash2 style={{ display: 'inline-block' }} />{t('accountHistory:burnedMessage', { amount, symbol })}</Text>
                              </CardBody>
                            </Card>
                          )
                        }

                        case t('accountHistory:contractInteraction'): {
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text>
                                  <FiCpu style={{ display: 'inline-block' }} />{t('accountHistory:interactedWithContractMessage')}
                                  {' '}
                                  <Link href={`${selectedNetwork?.explorerUrl}/contract/${op.contractId}`} isExternal>
                                    {truncateAccount(op.contractId!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                  </Link>
                                </Text>
                              </CardBody>
                            </Card>
                          )
                        }

                        case t('accountHistory:contractUpload'): {
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text>
                                  <FiUpload style={{ display: 'inline-block' }} />{t('accountHistory:uploadedContractMessage')}
                                  {' '}
                                  <Link href={`${selectedNetwork?.explorerUrl}/contract/${op.contractId}`} isExternal>
                                    {truncateAccount(op.contractId!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                  </Link>
                                </Text>
                              </CardBody>
                            </Card>
                          )
                        }

                        default:
                          return (
                            <Card key={`${parsedTx.id}-${opIdx}`}>
                              <CardBody>
                                <Text>{op.type} / {op.contractId}</Text>
                              </CardBody>
                            </Card>
                          )
                      }
                    })
                  }
                </CardBody>
              </Card>
            )
          })
        }
        <Stack direction='row' spacing={4}>
          <Button size='xs' leftIcon={<FiArrowLeft />} isDisabled={isNextDisabled} onClick={loadNext}>
            {t('common:next')}
          </Button>
          <Tooltip
            label={t('accountHistory:numberRecordsPerPage')}
            placement="bottom"
            hasArrow
          >
            <NumberInput
              width='60px'
              size='xs'
              min={5}
              max={50}
              step={5}
              value={limit}
              onChange={handleLimitChange}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Tooltip>
          <Button size='xs' rightIcon={<FiArrowRight />} isDisabled={isPreviousDisabled} onClick={loadPrevious}>
            {t('common:previous')}
          </Button>
        </Stack>
      </VStack>
    </Skeleton>
  )
}