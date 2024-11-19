import { Client } from '@stomp/stompjs'

const chatList = document.getElementById('chat-list')

class Helpers {
  #debounceTimeout

  constructor() {
    this.#debounceTimeout = 0
  }

  debounce(func, delay) {
    return (...args) => {
      clearTimeout(this.#debounceTimeout)

      this.#debounceTimeout = setTimeout(() => func(...args), delay)
    }
  }
}

class Fetcher {
  #store

  constructor() {
    this.#store = {}
  }

  getStore = () => {
    const result = structuredClone(this.#store)
    console.log({ store: result })

    return result
  }

  #request = async ({
    method,
    baseUrl,
    params = {},
    headers = {},
    body,
    onProcessing,
    onSuccess,
    onError,
    onCacheResponse,
  }) => {
    try {
      if (onProcessing) onProcessing()

      const queryString = params
        ? `?${new URLSearchParams(params).toString()}`
        : ''

      const url = `${baseUrl}${queryString}`

      const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        ...(body && { body: JSON.stringify(body) }),
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        const error = await response.json()

        if (onError) onError(error)
        return
      }

      const data = await response.json()

      if (onCacheResponse) onCacheResponse(data)

      if (onSuccess) onSuccess(data)
    } catch (error) {
      if (onError) onError(error)
    }
  }

  GET = async ({ baseUrl, params, onProcessing, onSuccess, onError }) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : ''

    const accessKey = queryString?.trim().length ? queryString : 'base'

    if (!this.#store[baseUrl]) {
      this.#store[baseUrl] = {}
    }

    if (this.#store[baseUrl][accessKey]) {
      const data = this.#store[baseUrl][accessKey]
      if (onSuccess) onSuccess(data)
      return
    }

    await this.#request({
      method: 'GET',
      baseUrl,
      params,
      onProcessing,
      onSuccess,
      onError,
      onCacheResponse: (data) => {
        this.#store[baseUrl][accessKey] = data
      },
    })
  }

  POST = async ({
    baseUrl,
    headers,
    body,
    onProcessing,
    onSuccess,
    onError,
  }) => {
    await this.#request({
      method: 'POST',
      baseUrl,
      headers,
      body,
      onProcessing,
      onSuccess,
      onError,
    })
  }

  PATCH = async ({
    baseUrl,
    headers,
    body,
    onProcessing,
    onSuccess,
    onError,
  }) => {
    await this.#request({
      method: 'PATCH',
      baseUrl,
      headers,
      body,
      onProcessing,
      onSuccess,
      onError,
    })
  }

  DELETE = async ({ baseUrl, params, onProcessing, onSuccess, onError }) => {
    await this.#request({
      method: 'DELETE',
      baseUrl,
      params,
      onProcessing,
      onSuccess,
      onError,
    })
  }
}

class ChatManager {
  #me = null
  #pinnedChats = []
  #permanentChats = []
  #refiningKey = ''

  constructor(fetcher) {
    if (!fetcher || typeof fetcher.GET !== 'function') {
      throw new Error('A valid fetcher with a GET method is required.')
    }

    fetcher.GET({
      baseUrl: '/api/v1/users/me',
      onSuccess: (data) => {
        this.#me = data
      },
      onError: (error) => {
        console.error('Fetching current user data failed :', error)
      },
    })
  }

  #renderChats = () => {
    chatList.innerHTML = ''
    const chats = [...this.#pinnedChats, ...this.#permanentChats].filter(
      (chat) => {
        if (!this.#refiningKey?.trim()) return true

        return chat.name === this.#refiningKey
      }
    )

    chats.map((chatMetadata) => {
      const { id, name, avatarUrl } = chatMetadata
      const chatItemNode = document.createElement('li')
      chatItemNode.className = 'chat-item'
      chatItemNode.id = `user-chat-${id}`
      chatItemNode.innerHTML = `
      <aside class="chat-avatar" data-online="${'false'}">
          <img src="${avatarUrl}" alt="User Image"/>
      </aside>
      <main class="chat-metadata">
          <header class="chat-metadata-header">
              <h2 class="chat-sender">${name}</h2>
              <span class="chat-send-time">09:12 AM</span>
          </header>
          <p class="message-preview">hi dude what's up</p>
      </main>
      `
      chatList.appendChild(chatItemNode)
    })
  }

  #getChatMetadata = (chat) => {
    const { id, name, type, members } = chat
    const myName = this.#me.name
    const myAvatarUrl = this.#me.avatarUrl

    switch (type.name) {
      case 'self':
        return { id, name: myName, avatarUrl: myAvatarUrl }

      case 'one-to-one':
        const receiver = members.filter((item) => item.name !== myName)?.[0]
        return {
          id,
          name: receiver?.name,
          avatarUrl: receiver?.avatarUrl,
        }

      default:
        return {
          id,
          name: name,
          avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6388/6388070.png',
        }
    }
  }

  getMe = () => {
    return structuredClone(this.#me)
  }

  refine = (key) => {
    this.#refiningKey = key?.trim()
    this.#renderChats()
  }

  addChat = (chat) => {
    if (chat) {
      this.#permanentChats.unshift(this.#getChatMetadata(chat))
      this.#renderChats()
    }
  }
}

class Socket {
  #stompClient

  constructor() {
    this.#stompClient = Socket.#getClient()
  }

  static #getClient = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => console.debug(`[STOMP Debug]: ${str}`),
      reconnectDelay: 5000,
    })

    return client
  }

  connect = () => {
    this.#stompClient.onConnect = (_frame) => {
      this.#stompClient.subscribe(`/broadcaster`, (message) => {
        console.log({ message: message.body })
      })
    }

    this.#stompClient.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers['message'])
      console.error('Additional details:', frame.body)
    }

    this.#stompClient.activate()
  }

  disconnect = () => {
    if (this.#stompClient.active) {
      this.#stompClient.deactivate()
    }
  }

  send = (destination = '/wpp', message = {}) => {
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

const helpers = new Helpers()
const fetcher = new Fetcher()
const socket = new Socket()
const chatManager = new ChatManager(fetcher)

socket.connect()
export { fetcher, chatManager, helpers }
