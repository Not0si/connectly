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
    onStart,
    onComplete,
    onError,
    onCacheResponse,
  }) => {
    try {
      if (onStart) onStart()

      const queryString = Object.keys(params).length
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

class SocketManager {
  #stompClient

  constructor() {
    this.#stompClient = SocketManager.#getClient()
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

class StateManager {
  #me
  #chats
  #activeChat
  #observers

  constructor(httpRequestManager) {
    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate StateManager!'
      )
    }

    this.#observers = []
    this.#chats = []
    this.#activeChat = null

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

  /**
   * @param {string} name
   */
  set active_chat(name) {
    this.#activeChat = name
  }

  get me() {
    return structuredClone(this.#me)
  }

  updateChats = (chat) => {
    this.#chats = [chat, ...this.#chats]
    this.#notify({ for: 'chatsContainer', data: this.#chats })
  }

  #notify = (data) => {
    this.#observers.forEach((observer) => {
      if (typeof observer.update === 'function') {
        observer.update(data)
      } else {
        console.warn('Observer does not have an update method:', observer)
      }
    })
  }

  subscribe = (observer) => {
    this.#observers.push(observer)
  }
}

class ChatModalRenderer {
  #modal
  #modalStep
  #chatType
  #groupName
  #groupDescription
  #submitButton
  #currentPage
  #searchBy
  #observer
  #usersList
  #selectedMembers
  #totalPages
  #timeoutId
  #httpRequestManager
  #stateManager

  constructor(httpRequestManager, stateManager) {
    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate UserSetting!'
      )
    }

    if (!stateManager) {
      throw new Error(
        'An instance of StateManager is required to instantiate UserSetting!'
      )
    }

    this.#init(httpRequestManager, stateManager)

    this.#modalManager()
  }

  #init = (httpRequestManager, stateManager) => {
    this.#modalStep = 1
    this.#chatType = 'direct'
    this.#groupName = ''
    this.#groupDescription = ''
    this.#currentPage = 0
    this.#totalPages = 1
    this.#searchBy = ''
    this.#timeoutId = 0
    this.#selectedMembers = {}
    this.#usersList = []
    this.#observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && this.#currentPage < this.#totalPages - 1) {
          this.#currentPage++
          this.#fetchUsers()
        }
      })
    })

    if (stateManager) {
      this.#stateManager = stateManager
    }

    if (httpRequestManager) {
      this.#httpRequestManager = httpRequestManager
    }

    const submitButton = document.getElementById('submit-modal-btn')
    submitButton.innerText = 'Next'
    submitButton.disabled = false
    this.#submitButton = submitButton

    this.#modal = document.getElementById('new-chat-modal')
  }

  #modalManager = () => {
    const modal = this.#modal
    const openButton = document.getElementById('open-new-chat-modal')
    const closeButton = document.getElementById('close-new-chat-modal')
    const cancelButton = document.getElementById('cancel-modal-btn')
    const formContent = document.getElementById('modal-form-content')
    const submitButton = this.#submitButton

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

    closeButton.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault()
        submitButton.focus()
      }
    })

    submitButton.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        closeButton.focus()
      }
    })

    submitButton.addEventListener('click', (event) => {
      event.preventDefault()

      switch (this.#modalStep) {
        case 1:
          this.#modalStep = 2
          this.#renderStepTwo(formContent)

          if (this.#chatType === 'direct') {
            submitButton.innerText = 'Submit'
          }

          submitButton.disabled = true
          break

        case 2:
          if (this.#chatType === 'direct') {
            this.#createChat()
            break
          }

          if (this.#chatType === 'group') {
            this.#modalStep = 3
            this.#renderStepThree(formContent)
            submitButton.innerText = 'Submit'
            submitButton.disabled = true
            break
          }

        case 3:
          this.#createChat()
          break

        default:
          break
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

  #createChat = () => {
    this.#httpRequestManager.POST({
      baseUrl: '/api/v1/chats',
      body: {
        name: this.#chatType === 'direct' ? undefined : this.#groupName,
        description:
          this.#chatType === 'direct' ? undefined : this.#groupDescription,
        type: this.#chatType,
        owner: this.#stateManager.me.name,
        members: Object.keys(this.#selectedMembers),
      },
      onStart: () => {
        this.#submitButton.disabled = true
      },
      onComplete: (response) => {
        const chat = response
        chat.initial = 'GP'

        if (response?.type?.name === 'direct') {
          const newMembers = response.members.find(
            (item) => item.name !== this.#stateManager.me.name
          )

          chat.members = [newMembers]
          chat.name = newMembers.name
          chat.avatarUrl = newMembers.avatarUrl
          chat.initial = undefined
        }

        this.#modal.classList.remove('open-modal')
        this.#stateManager.updateChats(chat)
      },
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

      if (event.target.value && event.target.value.length >= 6) {
        this.#submitButton.disabled = false
      } else {
        this.#submitButton.disabled = true
      }
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
        this.#chatType = event.target.value
      })
    })
  }

  #renderStepTwo = (formContent) => {
    if (!formContent || !(formContent instanceof HTMLElement)) {
      console.error('Invalid formContent passed to #renderStepTwo')
      return
    }

    // Clear any existing content
    while (formContent.firstChild) {
      formContent.removeChild(formContent.firstChild)
    }

    // Create the search container
    const searchContainer = document.createElement('section')
    searchContainer.className = 'search-container'

    const searchInput = document.createElement('input')
    searchInput.id = 'user-search'
    searchInput.type = 'text'
    searchInput.placeholder = 'Search user'
    searchInput.className = 'search-input'
    searchContainer.appendChild(searchInput)

    // Add search container to formContent
    formContent.appendChild(searchContainer)

    // Create the users list container
    const usersList = document.createElement('section')
    usersList.id = 'users-list'
    usersList.className = 'users-list'
    usersList.addEventListener('keydown', (event) => {
      const arrowKeys = ['ArrowUp', 'ArrowDown']

      if (arrowKeys.includes(event.key)) {
        event.preventDefault()
        event.stopPropagation()
      }
    })
    // Add users list to formContent
    formContent.appendChild(usersList)

    // Add input event listener
    searchInput.addEventListener('input', (event) => {
      this.#onSearchInput(event.target.value || '')
    })

    // Set reference to users list
    this.#usersList = usersList

    this.#fetchUsers()
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
        this.#renderUserList(users, false)
      },
      onError: (error) => {
        console.error('Error while fetching', error)
      },
    })
  }

  #renderUserList = (usersData = []) => {
    const listNodes = usersData.map(({ name, avatarUrl }, index) => {
      const listItem = this.#createUserListItem(name, avatarUrl, index)
      this.#usersList.appendChild(listItem)
      return listItem
    })

    this.#usersList.addEventListener('keydown', (event) => {
      const items = listNodes
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

    if (listNodes.length > 0) {
      this.#observer.disconnect()
      this.#observer.observe(listNodes[listNodes.length - 1])
    }

    //
  }

  #createUserListItem = (name, avatarUrl, index) => {
    const listItem = document.createElement('button')
    listItem.type = 'button'
    if (index !== 0) {
      listItem.tabIndex = '-1'
    }
    const isActive = Object.keys(this.#selectedMembers ?? {}).includes(name)
    listItem.className = isActive ? 'user-item active-member' : 'user-item'
    listItem.setAttribute('name', name)

    const avatar = document.createElement('img')
    avatar.className = 'user-item-avatar'
    avatar.src = avatarUrl
    avatar.alt = 'User Avatar'

    const nameElement = document.createElement('p')
    nameElement.className = 'user-item-name'
    nameElement.textContent = name

    listItem.appendChild(avatar)
    listItem.appendChild(nameElement)

    listItem.addEventListener('click', this.#handleSelectUser)
    return listItem
  }

  #handleSelectUser = (event) => {
    const listItem = event.target.closest('.user-item')
    const name = listItem.getAttribute('name')

    if (this.#chatType === 'direct') {
      this.#handleDirectChatSelection(name, listItem)
    } else if (this.#chatType === 'group') {
      this.#handleGroupChatSelection(name, listItem)
    }

    if (!Object.keys(this.#selectedMembers).length) {
      this.#submitButton.disabled = true
    } else {
      this.#submitButton.disabled = false
    }
  }

  #handleDirectChatSelection = (name, listItem) => {
    if (this.#selectedMembers[name]) {
      listItem.classList.remove('active-member')
      this.#selectedMembers = {}
    } else {
      // Clear all active members
      this.#usersList
        .querySelectorAll('.active-member')
        .forEach((item) => item.classList.remove('active-member'))

      // Mark the current item as active and update selected members
      listItem.classList.add('active-member')
      this.#selectedMembers = {
        [name]: { node: listItem, name },
      }
    }
  }

  #handleGroupChatSelection = (name, listItem) => {
    if (this.#selectedMembers[name]) {
      listItem.classList.remove('active-member')
      const { [name]: _, ...restItems } = this.#selectedMembers
      this.#selectedMembers = restItems
    } else {
      listItem.classList.add('active-member')
      this.#selectedMembers[name] = { node: listItem, name }
    }
  }

  //
}

class ChatsContainerRenderer {
  #chatsContainer
  #refineInput
  #chats
  #refineString
  #stateManager

  constructor(stateManager) {
    if (!stateManager) {
      throw new Error(
        'An instance of StateManager is required to instantiate ChatsContainerRenderer!'
      )
    }

    //
    this.#stateManager = stateManager
    this.#chatsContainer = document.getElementById('chats-container')
    this.#refineInput = document.getElementById('refine-input')
    this.#chats = []
    this.#refineString = ''

    //
    this.#refineInput.addEventListener('input', (event) => {
      this.#refineString = event.target.value?.trim() ?? ''
      this.#updateUI()
    })
  }

  update = (payload) => {
    if (payload?.for !== 'chatsContainer') return
    this.#chats = payload.data ?? []
    this.#updateUI()
  }

  #updateUI = () => {
    const renderedChats = this.#chats.filter((chat) => {
      if (!this.#refineString.trim()) return true
      return chat.name !== this.#refineString
    })

    this.#chatsContainer.innerHTML = ''

    renderedChats.map((chat, index) => {
      const { name, initial, avatarUrl } = chat

      const chatButton = this.#createChatItem({ name, initial, avatarUrl })

      chatButton.addEventListener('click', () => {
        this.#stateManager.active_chat = name
      })

      if (this.#chatsContainer) {
        this.#chatsContainer.appendChild(chatButton)
      }

      return chatButton
    })
  }

  #createChatItem = ({
    name,
    initial,
    avatarUrl,
    messageTime,
    messageValue,
  }) => {
    // Create the list item element
    const listItem = document.createElement('li')
    listItem.className = 'chat-item'
    listItem.tabIndex = 0

    // Create the image element
    let img
    if (initial) {
      img = document.createElement('div')
      img.innerText = initial
      img.className = 'chat-avatar initial'
    } else if (avatarUrl) {
      img = document.createElement('img')
      img.src = avatarUrl
      img.alt = 'Contact'
      img.className = 'chat-avatar'
    }

    // Create the chat details container
    const chatDetails = document.createElement('div')
    chatDetails.className = 'chat-details'

    // Create the chat header
    const chatHeader = document.createElement('div')
    chatHeader.className = 'chat-header'

    const headerTitle = document.createElement('h4')
    headerTitle.textContent = name ?? 'Unknown'

    const timeSpan = document.createElement('span')
    timeSpan.className = 'time'
    timeSpan.textContent = messageTime ?? '0s'

    chatHeader.appendChild(headerTitle)
    chatHeader.appendChild(timeSpan)

    // Create the last message paragraph
    const lastMessage = document.createElement('p')
    lastMessage.className = 'last-message'
    lastMessage.textContent = messageValue ?? 'Start new conversation'

    // Append header and message to chat details
    chatDetails.appendChild(chatHeader)
    chatDetails.appendChild(lastMessage)

    // Append image and chat details to the list item
    listItem.appendChild(img)
    listItem.appendChild(chatDetails)

    return listItem
  }
}

class DropDownRenderer {
  constructor() {
    this.#dropdownEvents()
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
}

class ChatEditorRenderer {
  constructor() {}
}

const httpRequestManager = new HttpRequestManager()
const stateManager = new StateManager(httpRequestManager)

//
const dropDownRenderer = new DropDownRenderer()
const chatModalRenderer = new ChatModalRenderer(
  httpRequestManager,
  stateManager
)
const chatsContainerRenderer = new ChatsContainerRenderer(stateManager)

stateManager.subscribe(dropDownRenderer)
stateManager.subscribe(chatModalRenderer)
stateManager.subscribe(chatsContainerRenderer)
