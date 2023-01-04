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
  title = 'Are you sure?',
  body = 'Are you sure you want to perform this action?',
  declineText = 'No',
  acceptText = 'Yes',
  onDecline,
  onAccept
}: ConfirmationDialogProps): JSX.Element => {
  const modal = useModal()
  const modalRef = useRef(null)

  const bodyTxt = mapText(body)

  return (
    <AlertDialog
      isOpen={modal.visible}
      leastDestructiveRef={modalRef}
      onClose={modal.hide}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            {title}
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
              {acceptText}
            </Button>
            {
              declineText && (
                <Button
                  ref={modalRef as React.LegacyRef<HTMLButtonElement> | undefined}
                  onClick={() => {
                    if (onDecline) onDecline()
                    modal.hide()
                  }}
                >
                  {declineText}
                </Button>
              )
            }
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
})