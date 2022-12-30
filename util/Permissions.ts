export const PERMISSIONS: Record<string, Record<string, string>> = {
  'accounts': {
    'getAccounts': 'Can request to select accounts to share with the application'
  },
  'signer': {
    'signTransaction': 'Can request to sign a transaction',
    'signAndSendTransaction': 'Can request to sign and send a transaction',
    'prepareTransaction': 'Can use My Koinos Wallet to prepare a transaction'
  },
  'provider': {
    'call': 'Can use My Koinos Wallet to make a call to the RPC server',
    'getNonce': 'Can use My Koinos Wallet to get the nonce of an account',
    'getNextNonce': 'Can use My Koinos Wallet to get the next nonce of an account',
    'getAccountRc': 'Can use My Koinos Wallet to get the available Mana of an account',
    'getTransactionsById': 'Can use My Koinos Wallet to get a transaction by id',
    'getBlocksById': 'Can use My Koinos Wallet to get a block by id',
    'getHeadInfo': 'Can use My Koinos Wallet to get the chain head information',
    'getChainId': 'Can use My Koinos Wallet to get the chain id',
    'getBlocks': 'Can use My Koinos Wallet to get blocks',
    'getBlock': 'Can use My Koinos Wallet to get a block',
    'wait': 'Can use My Koinos Wallet to wait for transaction to be included in a block',
    'sendTransaction': 'Can use My Koinos Wallet to send a transaction that is already prepared and signed',
    'readContract': 'Can use My Koinos Wallet to read a contract',
    'submitBlock': 'Can use My Koinos Wallet to submit a block'
  }
}
