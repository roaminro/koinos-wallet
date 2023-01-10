import React, { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button
} from '@chakra-ui/react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import useTranslation from 'next-translate/useTranslation'

interface ConfirmationDialogProps {
  title?: string
  body?: string
  declineText?: string | null
  onDecline?: () => void
  acceptText?: string
  onAccept?: () => void
}

const mapText = (text: string): JSX.Element[] => {
  const textSplit = text.split('<br />')
  return textSplit.map((e: string) => {
    return (
      <span key={e}>
        {e}
        <br />
      </span>
    )
  })
}

export default NiceModal.create(({
  title,
  body,
  declineText,
  acceptText,
  onDecline,
  onAccept
}: ConfirmationDialogProps): JSX.Element => {
  const { t } = useTranslation()
  const modal = useModal()
  const modalRef = useRef(null)
  
  const fTitle = title || t('confirmDialog:defaultTitle')
  const fBody = body || t('confirmDialog:defaultBody')
  const fDeclineText = declineText || t('common:no')
  const fAcceptText = acceptText || t('common:yes')

  const bodyTxt = mapText(fBody!)

  return (
    <AlertDialog
      isOpen={modal.visible}
      leastDestructiveRef={modalRef}
      onClose={modal.hide}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            {fTitle}
          </AlertDialogHeader>

          <AlertDialogBody>
            {bodyTxt}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ml={3}
              colorScheme='red'
              ref={modalRef as React.LegacyRef<HTMLButtonElement> | undefined}
              onClick={() => {
                if (onAccept) onAccept()
                modal.hide()
              }}
            >
              {fAcceptText}
            </Button>
            {
              fDeclineText && (
                <Button
                  ref={modalRef as React.LegacyRef<HTMLButtonElement> | undefined}
                  onClick={() => {
                    if (onDecline) onDecline()
                    modal.hide()
                  }}
                >
                  {fDeclineText}
                </Button>
              )
            }
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
})