import { Link, Stack, Heading, Skeleton, Card, CardBody, VStack, Text } from '@chakra-ui/react'
import { Serializer, utils } from 'koilib'
import { useEffect, useRef, useState } from 'react'
import { FiCpu, FiDownload, FiExternalLink, FiPlus, FiSend, FiTrash2, FiUpload } from 'react-icons/fi'
import { useNetworks } from '../context/NetworksProvider'
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
  }[]
}

export function Transactions() {

  const { selectedAccount } = useWallets()
  const { selectedNetwork } = useNetworks()

  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])

  const { transactions, isLoading: isLoadingAccountHistory } = useAccountHistory(selectedAccount?.account?.public.address)

  const serializer = useRef(new Serializer(utils.tokenAbi.koilib_types))

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
                        let type = 'Received'
                        if (selectedAccount?.account.public.address === args.from) {
                          type = 'Sent'
                        }
                        parsedTx.operations.push({
                          type,
                          contractId: op.call_contract.contract_id!,
                          from: args.from as string,
                          to: args.to as string,
                          amount: args.value as string || '0'
                        })
                        break
                      }
                      case 'burn': {
                        let type = 'Burned'
                        parsedTx.operations.push({
                          type,
                          contractId: op.call_contract.contract_id!,
                          from: args.from as string,
                          amount: args.value as string
                        })
                        break
                      }
                      case 'mint': {
                        let type = 'Minted'
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
                      type: 'Contract interaction',
                      contractId: op.call_contract.contract_id!
                    })
                  }
                } else if (op.upload_contract) {
                  parsedTx.operations.push({
                    type: 'Contract upload',
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
  }, [isLoadingAccountHistory, selectedAccount?.account.public.address, transactions])

  return (
    <Stack mt='6' spacing='3'>
      <Heading size='sm'>Activity</Heading>
      <Skeleton isLoaded={!isLoadingAccountHistory}>
        <VStack>
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
                        Mana used: {utils.formatUnits(parsedTx.manaUsed, selectedNetwork?.tokenDecimals!)}
                      </Text>
                    }
                    {
                      parsedTx.operations.map((op, opIdx) => {
                        let symbol = ''
                        let amount = ''
                        if (op.contractId === selectedNetwork?.tokenAddress) {
                          symbol = selectedNetwork.tokenSymbol
                          amount = utils.formatUnits(op.amount!, selectedNetwork.tokenDecimals)
                        } else if (op.amount) {
                          symbol = op.contractId
                          amount = `${op.amount} (unparsed amount) tokens with contract id`
                        }

                        switch (op.type) {
                          case 'Sent': {
                            return (
                              <Card key={`${parsedTx.id}-${opIdx}`}>
                                <CardBody>
                                  <Text>
                                    <FiSend style={{ display: 'inline-block' }} /> Sent {amount} {symbol} to
                                    {' '}
                                    <Link href={`${selectedNetwork?.explorerUrl}/address/${op.to}`} isExternal>
                                      {truncateAccount(op.to!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                    </Link>
                                  </Text>
                                </CardBody>
                              </Card>
                            )
                          }

                          case 'Received': {
                            return (
                              <Card key={`${parsedTx.id}-${opIdx}`}>
                                <CardBody>
                                  <Text>
                                    <FiDownload style={{ display: 'inline-block' }} /> Received {amount} {symbol} from
                                    {' '}
                                    <Link href={`${selectedNetwork?.explorerUrl}/address/${op.from}`} isExternal>
                                      {truncateAccount(op.from!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                    </Link>
                                  </Text>
                                </CardBody>
                              </Card>
                            )
                          }

                          case 'Minted': {
                            return (
                              <Card key={`${parsedTx.id}-${opIdx}`}>
                                <CardBody>
                                  <Text><FiPlus style={{ display: 'inline-block' }} />Minted {amount} {symbol} to your account</Text>
                                </CardBody>
                              </Card>
                            )
                          }

                          case 'Burned': {
                            return (
                              <Card key={`${parsedTx.id}-${opIdx}`}>
                                <CardBody>
                                  <Text><FiTrash2 style={{ display: 'inline-block' }} />Burned {amount} {symbol} from your account</Text>
                                </CardBody>
                              </Card>
                            )
                          }

                          case 'Contract interaction': {
                            return (
                              <Card key={`${parsedTx.id}-${opIdx}`}>
                                <CardBody>
                                  <Text>
                                    <FiCpu style={{ display: 'inline-block' }} /> Interacted with contract
                                    {' '}
                                    <Link href={`${selectedNetwork?.explorerUrl}/contract/${op.contractId}`} isExternal>
                                      {truncateAccount(op.contractId!)} <FiExternalLink style={{ display: 'inline-block' }} />
                                    </Link>
                                  </Text>
                                </CardBody>
                              </Card>
                            )
                          }

                          case 'Contract upload': {
                            return (
                              <Card key={`${parsedTx.id}-${opIdx}`}>
                                <CardBody>
                                  <Text>
                                    <FiUpload style={{ display: 'inline-block' }} /> Uploaded contract
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
          <Text>
            <Link href={`${selectedNetwork?.explorerUrl}/address/${selectedAccount?.account.public.address}`} isExternal>
              See more <FiExternalLink style={{ display: 'inline-block' }} />
            </Link>
          </Text>
        </VStack>
      </Skeleton>
    </Stack>
  )
}