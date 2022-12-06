import { Box, Button, Card, CardBody, CardFooter, Divider, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import SidebarWithHeader from '../components/Sidebar'

export default function Welcome() {
  const router = useRouter()

  return (
    <>
      <Box padding={{ base: 4, md: 8 }} margin='auto' maxWidth='1024px'>
        <Stack mt='6' spacing='3' align='center'>

          <Heading size='lg'>Welcome to Koinos</Heading>

          <Card maxW='sm'>
            <CardBody>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Create a new wallet</Heading>
                <Text>
                  Create a new wallet if this is your first time using Koinos.
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button variant='solid' colorScheme='green' onClick={() => router.push('/create-wallet')}>
                Create wallet
              </Button>
            </CardFooter>
          </Card>

          <Card maxW='sm'>
            <CardBody>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Import an existing wallet</Heading>
                <Text>
                  Import an existing wallet if you already have a 12 words &quot;Secret Phrase&quot; available.
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button variant='solid' colorScheme='blue' onClick={() => router.push('/import-wallet')}>
                Import wallet
              </Button>
            </CardFooter>
          </Card>
        </Stack>
      </Box>
    </>
  )
}
