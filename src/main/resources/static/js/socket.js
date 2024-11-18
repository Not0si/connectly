import { Client } from '@stomp/stompjs'

let stompClient = null

const getStompClient = () => {
  const stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
  })

  return stompClient
}

const connect = () => {
  stompClient = getStompClient()

  stompClient.onConnect = (_frame) => {
    stompClient.subscribe(`/broadcaster`, (message) => {
      console.log({ message: message.body })
    })
  }

  stompClient.activate()
}

const sendSocketMessage = (destination, message) => {
  stompClient.publish({
    destination: destination ?? '/wpp',
    body: JSON.stringify(message),
  })
}

connect()
