const hoistNonReactStatics = require('hoist-non-react-statics')

module.exports = {
  locales: ['en'],
  defaultLocale: 'en',
  staticsHoc: hoistNonReactStatics,
  pages: {
    '*': ['common', 'sidebar'],
    '/home': ['accountHistory'],
    '/language': ['language'],
    '/embed/getAccounts': ['getAccounts']
  },
}