import { Image, Box, Button, Card, CardBody, CardFooter, Divider, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import SidebarWithHeader from '../components/Sidebar'

export default function Welcome() {
  const router = useRouter()

  return (
    <SidebarWithHeader>
      <Box padding={{ base: 4, md: 8 }} margin='auto' maxWidth='1024px'>
        <Stack mt='6' spacing='3' align='center'>

          <Heading size='lg'>Welcome to</Heading>
          <Image
            src='/logo-txt.png'
            alt="My Koinos Wallet Text Logo"
            width='240px'
          />
          <Card maxW='sm'>
            <CardBody>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Create a new wallet</Heading>
                <Text>
                  Create a new wallet if this is your first time using My Koinos Wallet.
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button bg='brand.blue' onClick={() => router.push('/wallets/create')}>
                Create wallet
              </Button>
            </CardFooter>
          </Card>

          <Card maxW='sm'>
            <CardBody>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Import an existing wallet</Heading>
                <Text>
                  Import an existing wallet if you already have a 12 words &quot;Secret Recovery Phrase&quot; available.
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button bg='brand.blue' onClick={() => router.push('/wallets/import')}>
                Import wallet
              </Button>
            </CardFooter>
          </Card>

          <Card maxW='sm'>
            <CardBody>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Restore a backup</Heading>
                <Text>
                  If you already used My Koinos Wallet before, you can restore a backup your previously generated.
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button bg='brand.blue' onClick={() => router.push('/backup')}>
                Restore backup
              </Button>
            </CardFooter>
          </Card>
        </Stack>
      </Box>
    </SidebarWithHeader>
  )
}
