import { useColorModeValue, Image, ResponsiveValue } from '@chakra-ui/react'
import * as CSS from 'csstype'

interface LogoProps {
    size: ResponsiveValue<string>
    display: ResponsiveValue<CSS.Property.Display>
}

export default function Logo({ size, display }: LogoProps) {
  return (
      <Image
        src={useColorModeValue('/logo.png', '/logo-dark.png')}
        alt="My Koinos Wallet Logo"
        boxSize={size}
        display={display}
      />
  )
}