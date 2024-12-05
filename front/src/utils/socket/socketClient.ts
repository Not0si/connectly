import { Client, Frame, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class SocketManager {
  #stompClient: Client

  constructor() {
    this.#stompClient = this.#getClient()
  }

  #getClient(): Client {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str: string) => console.debug(`[STOMP Debug]: ${str}`),
      reconnectDelay: 5000,
    })

    return client
  }

  public connect(): void {
    this.#stompClient.onConnect = (_frame: Frame) => {
      this.#stompClient.subscribe('/broadcaster', (message: IMessage) => {
        console.log({ message: message.body })
      })
    }

    this.#stompClient.onStompError = (frame: Frame) => {
      console.error('Broker reported error:', frame.headers['message'])
      console.error('Additional details:', frame.body)
    }

    this.#stompClient.activate()
  }

  public disconnect(): void {
    if (this.#stompClient.active) {
      this.#stompClient.deactivate()
    }
  }

  public send(
    destination: string = '/wpp',
    message: Record<string, any> = {},
  ): void {
    try {
      this.#stompClient.publish({
        destination: destination,
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Error while publishing a message', error)
    }
  }
}

const socketClient = new SocketManager()

export { socketClient }
