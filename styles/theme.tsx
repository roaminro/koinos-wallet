import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  initialColorMode: 'system',
  colors: {
    brand: {
      blue: '#00c6f1',
    },
  },
})

export default theme