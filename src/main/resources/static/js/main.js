import { Client } from '@stomp/stompjs'

document.addEventListener('keydown', (event) => {
  const items = document.querySelectorAll('.chat-item')
  let currentIndex = Array.from(items).findIndex(
    (item) => item === document.activeElement
  )

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (currentIndex === -1) return
    let nextIndex =
      event.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1

    if (nextIndex >= 0 && nextIndex < items.length) {
      items[nextIndex].focus()
    }
  }
})

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
    onStart,
    onComplete,
    onError,
    onCacheResponse,
  }) => {
    try {
      if (onStart) onStart()

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

      if (onComplete) onComplete(data)
    } catch (error) {
      if (onError) onError(error)
    }
  }

  GET = async ({ baseUrl, params, onStart, onComplete, onError }) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : ''

    const accessKey = queryString?.trim().length ? queryString : 'base'

    if (!this.#store[baseUrl]) {
      this.#store[baseUrl] = {}
    }

    if (this.#store[baseUrl][accessKey]) {
      const data = this.#store[baseUrl][accessKey]
      if (onComplete) onComplete(data)
      return
    }

    await this.#request({
      method: 'GET',
      baseUrl,
      params,
      onStart,
      onComplete,
      onError,
      onCacheResponse: (data) => {
        this.#store[baseUrl][accessKey] = data
      },
    })
  }

  POST = async ({ baseUrl, headers, body, onStart, onComplete, onError }) => {
    await this.#request({
      method: 'POST',
      baseUrl,
      headers,
      body,
      onStart,
      onComplete,
      onError,
    })
  }

  PATCH = async ({ baseUrl, headers, body, onStart, onComplete, onError }) => {
    await this.#request({
      method: 'PATCH',
      baseUrl,
      headers,
      body,
      onStart,
      onComplete,
      onError,
    })
  }

  DELETE = async ({ baseUrl, params, onStart, onComplete, onError }) => {
    await this.#request({
      method: 'DELETE',
      baseUrl,
      params,
      onStart,
      onComplete,
      onError,
    })
  }
}

class ChatSettingsManager {
  #modalStep
  #chatType
  #groupName
  #groupDescription
  #currentPage
  #searchBy
  #observer
  #usersList
  #totalPages
  #timeoutId
  #httpRequestManager
  #stateController

  constructor(httpRequestManager, stateController) {
    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate UserSetting!'
      )
    }

    if (!stateController) {
      throw new Error(
        'An instance of StateController is required to instantiate UserSetting!'
      )
    }

    this.#init(httpRequestManager, stateController)
    this.#dropdownEvents()
    this.#modalManager()
  }

  #init = (httpRequestManager, stateController) => {
    this.#modalStep = 1
    this.#chatType = 'direct'
    this.#groupName = ''
    this.#groupDescription = ''
    this.#currentPage = 0
    this.#totalPages = 1
    this.#searchBy = ''
    this.#timeoutId = 0
    this.#usersList = []
    this.#observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && this.#currentPage < this.#totalPages - 1) {
          this.#currentPage++
          this.#fetchUsers()
        }
      })
    })

    this.#stateController = stateController
    if (httpRequestManager) {
      this.#httpRequestManager = httpRequestManager
    }
  }

  #dropdownEvents = () => {
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

  #modalManager = () => {
    const modal = document.getElementById('new-chat-modal')
    const openButton = document.getElementById('open-new-chat-modal')
    const closeButton = document.getElementById('close-new-chat-modal')
    const cancelButton = document.getElementById('cancel-modal-btn')
    const submitButton = document.getElementById('submit-modal-btn')
    const formContent = document.getElementById('modal-form-content')

    if (
      !modal ||
      !openButton ||
      !closeButton ||
      !submitButton ||
      !formContent
    ) {
      console.error('Missing modal elements.')
      return
    }

    submitButton.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        closeButton.focus()
      }
    })

    submitButton.addEventListener('click', (event) => {
      if (!this.#modalStep || this.#modalStep === 1) {
        event.preventDefault()
        this.#modalStep = 2
        this.#renderStepTwo(formContent)
        return
      }

      if (this.#modalStep === 2 && this.#chatType === 'direct') {
        event.preventDefault()
        return
      }

      if (this.#modalStep === 2 && this.#chatType === 'group') {
        event.preventDefault()
        this.#modalStep = 3
        this.#renderStepThree(formContent)

        return
      }

      if (this.#modalStep === 3) {
        return
      }
    })

    openButton.addEventListener('click', () => {
      modal.classList.add('open-modal')
      this.#init()
      this.#renderStepOne(formContent)
    })

    closeButton.addEventListener('click', () => {
      modal.classList.remove('open-modal')
    })

    cancelButton.addEventListener('click', () => {
      modal.classList.remove('open-modal')
    })
  }

  #renderStepThree = (formContent) => {
    formContent.innerHTML = `
     <div class="name-description-form-item">
              <label
                for="group-name"
                class="name-description-form-label"
                aria-required="true"
                >Name</label
              >
              <input
                id="group-name"
                class="name-description-form-input"
                type="text"
                minlength="6"
                required
              />
            </div>
            <div class="name-description-form-item">
              <label for="group-description" class="name-description-form-label"
                >Description</label
              >
              <textarea
                id="group-description"
                name="group-description"
                class="name-description-form-input"
                rows="6ss"
              ></textarea>
            </div>
    `

    const nameInput = formContent.querySelector('#group-name')
    const descriptionInput = formContent.querySelector('#group-description')

    nameInput.addEventListener('input', (event) => {
      this.#groupName = event.target.value
    })

    descriptionInput.addEventListener('input', (event) => {
      this.#groupDescription = event.target.value
    })
  }

  #renderStepOne = (modalBody) => {
    modalBody.innerHTML = `
     
       <label class="form-radio-card" tabindex="0">
              <aside class="form-radio-card-icon frci-1">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
                  ></path>
                </svg>
              </aside>
              <div class="form-radio-card-main">
                <h3>Direct Chat</h3>
                <p>
                  A private chat between you and the user you choose to connect
                  with.
                </p>
              </div>
              <input type="radio" name="chatType" value="direct" />
            </label>

            <label class="form-radio-card">
              <aside class="form-radio-card-icon frci-2">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z"
                  ></path>
                </svg>
              </aside>
              <div class="form-radio-card-main">
                <h3>Group Chat</h3>
                <p>
                  A shared chat where you can talk with multiple users in a
                  group.
                </p>
              </div>
              <input type="radio" name="chatType" value="group" />
            </label>
      
      `
    const radioInputs = modalBody.querySelectorAll('input[name="chatType"]')

    if (radioInputs.length > 0) {
      radioInputs[0].checked = true
      radioInputs[0].focus()
    }

    radioInputs.forEach((input) => {
      input.addEventListener('change', (event) => {
        this.chatType = event.target.value
      })
    })
  }

  #renderStepTwo = (formContent) => {
    if (!formContent || !(formContent instanceof HTMLElement)) {
      console.error('Invalid formContent passed to #renderStepTwo')
      return
    }

    formContent.innerHTML = `
    <section class="search-container">
      <input
        id="user-search"
        type="text"
        placeholder="Search user"
        class="search-input"
      />
    </section>
    <ul id="users-list" class="users-list"></ul>
  `

    const searchInput = formContent.querySelector('#user-search')
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.#onSearchInput(event.target.value || '')
      })
    } else {
      console.error('Search input not found in formContent')
    }

    this.#usersList = formContent.querySelector('#users-list')
    if (!this.#usersList) {
      console.error('Users list not found in formContent')
    } else {
      this.#fetchUsers()
    }
  }

  #onSearchInput = (value) => {
    this.#searchBy = value
    this.#currentPage = 0
    this.#totalPages = 1

    this.#debounce(() => {
      if (this.#usersList) this.#usersList.innerHTML = ''
      this.#fetchUsers()
    }, 500)()
  }

  #debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  #fetchUsers = async () => {
    await this.#httpRequestManager.GET({
      baseUrl: '/api/v1/users',
      params: {
        username: this.#searchBy,
        page: this.#currentPage ?? 0,
        size: 8,
      },
      onStart: () => {
        // loader.style.display = 'grid'
        // if (currentPage === 0 && totalPages === 1) {
        //   loader.style.height = '100px'
        // } else {
        //   loader.style.height = '40px'
        // }
        //  this.#usersList.appendChild(loader)
      },
      onComplete: (data) => {
        const users = data.content ?? []
        this.#totalPages = data.totalPages ?? 1
        this.#renderUsers(users, false)
      },
      onError: (error) => {
        console.error('Error while fetching', error)
      },
    })
  }

  #renderUsers = (usersData = [], isLoading = false) => {
    const domNodes = usersData.map((item) => {
      const { name, avatarUrl } = item

      const listItem = document.createElement('li')
      listItem.className = 'user-item'
      listItem.innerHTML = `
      <img class="user-item-avatar" src="${avatarUrl}" alt="User Avatar"/> 
      <p class="user-item-name">${name}</p>
      `
      // listItem.addEventListener('click', () => {
      //   const me = chatManager.getMe()

      //   this.#httpRequestManager.POST({
      //     baseUrl: '/api/v1/chats/one',
      //     body: {
      //       senderName: me.name,
      //       receiverName: name,
      //     },
      //     onSuccess: (data) => {
      //       chatManager.addChat(data)
      //       closeModal()
      //     },
      //     onError: (error) => {},
      //   })
      // })

      this.#usersList.appendChild(listItem)
      return listItem
    })

    if (domNodes.length > 0) {
      this.#observer.disconnect()
      this.#observer.observe(domNodes[domNodes.length - 1])
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
      onComplete: (data) => {
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
const stateController = new StateController(httpRequestManager)
new ChatSettingsManager(httpRequestManager, stateController)
//
// const socket = new Socket()
// socket.connect()
