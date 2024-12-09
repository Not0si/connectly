import { Client, Frame, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

class WebsocketClient {
  private socketClient: Client

  private static instance: WebsocketClient | null = null

  private constructor() {
    this.socketClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str: string) => console.debug(`[STOMP Debug]: ${str}`),
      reconnectDelay: 5000,
    })
  }

  public static getInstance(): WebsocketClient {
    if (!WebsocketClient.instance) {
      WebsocketClient.instance = new WebsocketClient()
    }

    return WebsocketClient.instance
  }

  public connect(): void {
    if (this.socketClient.active) return

    this.socketClient.onConnect = (_frame: Frame) => {
      this.socketClient.subscribe('/broadcaster', (message: IMessage) => {
        console.log({ message: message.body })
      })
    }

    this.socketClient.onStompError = (frame: Frame) => {
      console.error('Broker reported error:', frame.headers['message'])
      console.error('Additional details:', frame.body)
    }

    this.socketClient.activate()
  }

  public disconnect(): void {
    if (!this.socketClient.active) return

    this.socketClient.deactivate()
  }

  public send(
    destination: string = '/wpp',
    message: Record<string, any> = {},
  ): void {
    try {
      this.socketClient.publish({
        destination: destination,
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Error while publishing a message', error)
    }
  }
}

export default WebsocketClient
