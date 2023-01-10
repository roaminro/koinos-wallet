import { Stack, Card, CardHeader, Heading, Divider, CardBody, FormControl, FormLabel, Center } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import { locales } from '../i18n.js'
import { Select, SingleValue } from 'chakra-react-select'
import setLang from 'next-translate/setLanguage'

interface LocaleOption { label: string, value: string }

export default function Language() {
  const { t, lang } = useTranslation()

  const [language, setLanguage] = useState<LocaleOption | null>(null)

  const handleLanguageChange = async (newVal: SingleValue<LocaleOption>) => {
    setLanguage(newVal)
    if (newVal) {
      const date = new Date()
      const expireMs = 100 * 24 * 60 * 60 * 1000 // 100 days
      date.setTime(date.getTime() + expireMs)
      document.cookie = `NEXT_LOCALE=${newVal.value};expires=${date.toUTCString()};path=/`
      await setLang(newVal.value)
    }
  }

  useEffect(() => {
    setLanguage({
      label: t(`language:${lang}`),
      value: lang
    })
  }, [lang, t])

  const localesOptions: LocaleOption[] = []

  locales.map((locale) => {
    localesOptions.push({
      label: t(`language:${locale}`),
      value: locale
    })
  })

  return (
    <Center>
      <Card width='100%'>
        <CardHeader>
          <Heading size='md'>
            {t('language:language')}
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack mt='6' spacing='3'>
            <FormControl>
              <FormLabel>{t('language:chooseLanguage')}</FormLabel>
              <Select<LocaleOption, false>
                useBasicStyles
                options={localesOptions}
                placeholder={t('language:chooseLanguage')}
                closeMenuOnSelect={true}
                value={language}
                onChange={handleLanguageChange}
              />
            </FormControl>
          </Stack>
        </CardBody>
      </Card>
    </Center>
  )
}
