import { ReactElement } from 'react'
import Unlock from '../components/Unlock'
import type { NextPageWithLayout } from './_app'

const UnlockPage: NextPageWithLayout = () => {

  return (
    <Unlock />
  )
}

UnlockPage.getLayout = function getLayout(page: ReactElement) {
  return (
    page
  )
}

export default UnlockPage