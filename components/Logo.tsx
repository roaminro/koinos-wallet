import { useColorModeValue, Image, ResponsiveValue } from '@chakra-ui/react'

interface LogoProps {
    size: ResponsiveValue<string>;
}

export default function Logo({ size }: LogoProps) {
  return (
      <Image
        src={useColorModeValue('/logo.png', '/logo-dark.png')}
        alt="My Koinos Wallet Logo"
        boxSize={size}
        display='flex'
      />
  )
}