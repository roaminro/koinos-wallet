import { Box, Button, Input, Spinner } from '@chakra-ui/react'
import Head from 'next/head'
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { Messenger } from '../../util/Messenger'

export default function Accounts() {
  interface Message {
    msg: string
  }

  const [text, setText] = useState('')
  const [messenger, setMessenger] = useState<Messenger<Message>>()
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    console.log(window.location.origin)
    const msgr = new Messenger<Message>(window.opener, window.location.origin)
    setMessenger(msgr)

    const setupMessenger = async () => {
      msgr.onMessage(({ data }) => {
        setText(data.msg)
        setIsLoading(false)
      })

      await msgr.connect()
      console.log('connected to parent iframe')
    }

    setupMessenger()


    return () => {
      msgr.removeListener()
      console.log('removed')
    }
  }, [])

  const onClick = () => {
    console.log(messenger)
    messenger!.sendMessage({ msg: text })
  }

  const close = () => {
    self.close()
  }

  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value)
  }

  if (isLoading) return <Spinner />

  return (
    <Box>
      <Input value={text} onChange={onChange}></Input>
      <Button onClick={onClick}>click</Button>
      <Button onClick={close}>cancel</Button>
    </Box>
  )
}
