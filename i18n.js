const hoistNonReactStatics = require('hoist-non-react-statics')

module.exports = {
  locales: ['en'],
  defaultLocale: 'en',
  staticsHoc: hoistNonReactStatics,
  pages: {
    '*': [
      'common',
      'sidebar',
      'confirmDialog',
      'networkSelector',
      'renameAccountModal',
      'renameWalletModal',
      'revealPrivateKeyModal',
      'revealSecretRecoveryPhraseModal'
    ],
    '/home': ['accountHistory'],
    '/language': ['language'],
    '/embed/getAccounts': ['getAccounts']
  },
}