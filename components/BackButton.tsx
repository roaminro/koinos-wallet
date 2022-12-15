import { IconButton } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FiArrowLeft } from 'react-icons/fi'

export function BackButton() {
  const router = useRouter()
  return (
    <IconButton 
    size='xs'
    aria-label='back' 
    icon={<FiArrowLeft />} 
    onClick={() => router.back()}
    />
  )
}