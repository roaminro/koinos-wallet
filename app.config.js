const appConfig = {
  logLevel: 'debug',
  vaultWorkerLogLevel: 'info',
  defaultNetworks: [
    {
      name: 'Mainnet',
      chainId: 'EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==',
      nameserviceAddress: '19WxDJ9Kcvx4VqQFkpwVmwVEy1hMuwXtQE',
      tokenAddress: '15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL',
      tokenDecimals: 8,
      tokenName: 'Koin',
      tokenSymbol: 'KOIN',
      rpcUrl: 'https://api.koinos.io',
      explorerUrl: 'https://koinosblocks.com'
    },
    {
      name: 'Harbinger (testnet)',
      chainId: 'EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==',
      nameserviceAddress: '1AM1c73tDNTc24KYqYvSHmoZ2C7oe4DZhh',
      tokenAddress: '19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ',
      tokenDecimals: 8,
      tokenName: 'Test Koin',
      tokenSymbol: 'tKOIN',
      rpcUrl: 'https://harbinger-api.koinos.io',
      explorerUrl: 'https://koinosblocks.com'
    }
  ],
  defaultTokens: [
    {
      chainId: 'EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==',
      address: '1AdzuXSpC6K9qtXdCBgD5NUpDNwHjMgrc9',
      name: 'Virtual Hash Power',
      symbol: 'VHP',
      decimals: 8,
    },
    {
      chainId: 'EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==',
      address: '1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8',
      name: 'Test Virtual Hash Power',
      symbol: 'tVHP',
      decimals: 8,
    }
  ]
}

module.exports = appConfig
