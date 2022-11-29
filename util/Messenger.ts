
export interface IMessage {
  from: string
  to?: string
  type?: string
  data?: string
  error?: string
}

export type SendDataFn<OutgoingDataType> = (data: OutgoingDataType) => void
export type SendErrorFn = (error: string) => void

export type OnRequestFnArgs<IncomingDataType, OutgoingDataType> = {
  sender: string,
  data: IncomingDataType,
  sendData: SendDataFn<OutgoingDataType>,
  sendError: SendErrorFn
}

export type OnMessageFnArgs<IncomingDataType> = {
  sender: string,
  data: IncomingDataType
}

export type OnMessageFnType<IncomingDataType> = (args: OnMessageFnArgs<IncomingDataType>) => Promise<void> | void
export type OnRequestFnType<IncomingDataType, OutgoingDataType> = (args: OnRequestFnArgs<IncomingDataType, OutgoingDataType>) => Promise<void> | void

const CONNECTION_REQUEST_TYPE = 'messenger::connection::request'
const CONNECTION_REQUEST_ACK_TYPE = 'messenger::connection::ack'

export class Messenger<IncomingDataType, OutgoingDataType> {
  private id: string
  private targetId: string
  private target: Window
  private targetOrigin: string
  private onMessageFn?: OnMessageFnType<IncomingDataType>
  private onRequestFn?: OnRequestFnType<IncomingDataType, OutgoingDataType>
  private onMessageListenerAdded: boolean
  private connectionCancelled: boolean

  constructor(target: Window, targetOrigin = '*') {
    this.id = crypto.randomUUID()
    this.targetId = ''
    this.target = target
    this.targetOrigin = targetOrigin
    this.onMessageListenerAdded = false
    this.connectionCancelled = false
    this.addMessageListener()
  }

  private onMessageListener = async (event: MessageEvent<IMessage>) => {
    if (this.targetOrigin !== '*' && !this.targetOrigin.startsWith(event.origin)) return

    const { data, ports } = event

    if (data.type !== CONNECTION_REQUEST_TYPE && data.to !== this.id) return

    if (data && ports && ports[0]) {
      if (data.type === CONNECTION_REQUEST_TYPE) {
        ports[0].postMessage({ type: CONNECTION_REQUEST_ACK_TYPE, data: this.id })
        this.targetId = data.from
      } else if (this.onRequestFn) {
        await this.onRequestFn({
          sender: event.origin,
          data: JSON.parse(data.data!),
          sendData: (data: OutgoingDataType) => {
            ports[0].postMessage({ data })
          },
          sendError: (error: string) => {
            ports[0].postMessage({ error })
          }
        })
      }

      ports[0].close()
    } else if (data) {
      if (this.onMessageFn) {
        this.onMessageFn({
          sender: event.origin,
          data: JSON.parse(data.data!)
        })
      }
    }
  }

  private addMessageListener = () => {
    if (!this.onMessageListenerAdded) {
      this.onMessageListenerAdded = true
      window.addEventListener('message', (event) => this.onMessageListener(event))
    }
  }

  connect = async (numberOfAttempt: number = 20) => {
    if (this.connectionCancelled) {
      throw new Error('connection was cancelled')
    }

    try {
      const targetId = await this._sendRequest({ type: CONNECTION_REQUEST_TYPE, from: this.id }, 500)
      this.targetId = targetId as string
    } catch (error) {
      if (--numberOfAttempt <= 0) {
        throw new Error('could not connect to target')
      }

      await this.connect(numberOfAttempt)
    }
  }

  onMessage = (onMessageFn: OnMessageFnType<IncomingDataType>) => {
    this.onMessageFn = onMessageFn
  }

  onRequest = (onRequestFn: OnRequestFnType<IncomingDataType, OutgoingDataType>) => {
    this.onRequestFn = onRequestFn
  }

  removeListener = () => {
    this.connectionCancelled = true
    if (this.onMessageListenerAdded) {
      window.removeEventListener('message', this.onMessageListener)
    }
  }

  sendMessage = (message: OutgoingDataType) => this._sendMessage({ data: JSON.stringify(message), to: this.targetId, from: this.id })

  private _sendMessage = (message: IMessage) => {
    if (this.targetId === '') {
      throw new Error('messenger is not connected, please call "connect" first')
    }
    this.target.postMessage(message, this.targetOrigin)
  }

  sendRequest = <MessageType>(message: MessageType, timeout = 10000) => this._sendRequest({ data: JSON.stringify(message), to: this.targetId, from: this.id }, timeout)

  private _sendRequest = (message: IMessage, timeout = 10000) => (
    new Promise((resolve, reject) => {
      if (message.type !== CONNECTION_REQUEST_TYPE && this.targetId === '') {
        reject('messenger is not connected, please call "connect" first')
        return
      }

      let requestTimeout: number

      const {
        port1,
        port2,
      } = new MessageChannel()

      port1.onmessage = (evt) => {
        if (requestTimeout) {
          window.clearTimeout(requestTimeout)
        }
        port1.close()

        const message: IMessage = evt.data

        if (message.error) {
          reject(message.error)
        } else {
          resolve(message.data)
        }
      }

      this.target.postMessage(message, this.targetOrigin, [port2])

      if (timeout) {
        requestTimeout = window.setTimeout(() => {
          reject('request timed out')
        }, timeout)
      }
    })
  )
}