import { Client } from '@stomp/stompjs'

class HttpRequestManager {
  #store

  static #instance

  constructor() {
    if (HttpRequestManager.#instance) {
      return HttpRequestManager.#instance
    }

    this.#store = {}
    HttpRequestManager.#instance = this
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

class UserSetting {
  constructor(httpRequestManager) {
    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate UserSetting!'
      )
    }

    UserSetting.#dropdownEvents()
    UserSetting.#modalEvents(
      'new-chat-modal',
      'open-new-chat-modal',
      'close-new-chat-modal'
    )
  }

  static #dropdownEvents = () => {
    const dropdowns = document.querySelectorAll('.dropdown')

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector('.dropbtn')
      const menu = dropdown.querySelector('.dropdown-content')
      const menuItems = Array.from(menu.querySelectorAll('.drop-item'))

      const clickOutside = (event) => {
        if (!event.target.contains(dropdown)) {
          menu.classList.remove('drop-open')
        }
      }

      button.addEventListener('click', (event) => {
        console.log(menu.classList)
        if (menu.classList.contains('drop-open')) {
          menu.classList.remove('drop-open')
          window.removeEventListener('click', clickOutside)
        } else {
          menu.classList.add('drop-open')
          window.addEventListener('click', clickOutside)
        }

        // Prevent event from bubbling to window click listener
        event.stopPropagation()
      })

      menuItems.forEach((item) => {
        item.addEventListener('click', () => {
          menu.classList.remove('drop-open')
        })
      })

      //
    })
  }

  static #modalEvents = (
    modalSelector,
    openButtonSelector,
    closeButtonSelector
  ) => {
    const modal = document.getElementById(modalSelector)
    const openButton = document.getElementById(openButtonSelector)
    const closeButton = document.getElementById(closeButtonSelector)

    openButton.addEventListener('click', () => {
      console.log(1)
      modal.classList.add('open-modal')
    })

    closeButton.addEventListener('click', () => {
      modal.classList.remove('open-modal')
    })
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

class StateController {
  #me

  constructor(httpRequestManager) {
    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate StateController!'
      )
    }

    this.#fetchUserInformation(httpRequestManager)
  }

  #fetchUserInformation = (httpRequestManager) => {
    const img = document.getElementById('profile-img')
    const name = document.getElementById('profile-name')

    httpRequestManager.GET({
      baseUrl: '/api/v1/users/me',
      onSuccess: (data) => {
        this.#me = data

        name.innerHTML = data.name ?? 'Unknown'
        img.src =
          data.avatarUrl ??
          'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png'
      },
      onError: (error) => {
        console.error('Fetching current user data failed :', error)
      },
    })
  }

  getMe = () => {
    return structuredClone(this.#me)
  }
}

class InterfaceController {}

const httpRequestManager = new HttpRequestManager()
const userSetting = new UserSetting(httpRequestManager)
const stateController = new StateController(httpRequestManager)
const socket = new Socket()
socket.connect()
