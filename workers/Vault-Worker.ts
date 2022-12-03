import { Messenger } from '../util/Messenger'

interface IncomingMessage {
  command: string
  arguments?: string
}

interface OutgoingMessage {
  result: string
}
 
const messenger = new Messenger<number, number>(self, 'vault', false)

let cnter = 0


messenger.onMessage(({ data, sender }) => {
  // console.log('msgr received', data)

  cnter++
  console.log('cnter:', cnter, new Date().toLocaleString())
  // setTimeout(() => {
  //   console.log('timeout from worker')
  // }, 2000)
})

messenger.onRequest(({ data, sender, sendData }) => {
  console.log('request received', data)
  cnter++
  console.log('cnter:', cnter, new Date().toLocaleString())
  sendData(cnter)
})


self.addEventListener('install', (event) => {
  console.log('installing a new version of the Vault')
  //@ts-ignore
  self.skipWaiting()
})
