import { IconButton } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FiArrowLeft } from 'react-icons/fi'

export function BackButton() {
  const router = useRouter()
  const { t } = useTranslation()
  return (
    <IconButton 
    size='xs'
    aria-label={t('common:back')} 
    icon={<FiArrowLeft />} 
    onClick={() => router.back()}
    />
  )
}