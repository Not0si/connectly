import { Client } from '@stomp/stompjs'

import { templates } from './templates.js'

const RENDER_COMPONENT = Object.freeze({
  CHATS_CONTAINER: 'CHATS_CONTAINER',
  CHAT_EDITOR: 'CHAT_EDITOR',
})

class StateManager {
  #me
  #chats
  #chatsIds
  #activeChatId
  #observers

  constructor(httpRequestManager) {
    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate StateManager!',
      )
    }

    this.#observers = []
    this.#chats = []
    this.#chatsIds = []
    this.#activeChatId = null

    this.#fetchUserInformation(httpRequestManager)
  }

  #fetchUserInformation = (httpRequestManager) => {
    httpRequestManager.GET({
      baseUrl: '/api/v1/users/me',
      onComplete: (data) => {
        this.#me = data

        if (!data.name || !data.avatarUrl) {
          throw new Error('Invalid Data')
        }

        templates.updateUserProfile(data.name, data.avatarUrl)
      },
      onError: (error) => {
        console.error('Fetching current user data failed :', error)
      },
    })
  }

  get me() {
    return structuredClone(this.#me)
  }

  updateChats = (chat) => {
    const isExist = this.#chats.find((item) => item.id === chat.id)

    if (!isExist) {
      this.#chatsIds = [...this.#chatsIds, chat.id]
      this.#chats = [chat, ...this.#chats]
      this.#notify({
        for: RENDER_COMPONENT.CHATS_CONTAINER,
        data: this.#chats,
      })
    }
  }

  updateActiveChat = (id) => {
    if (this.#chatsIds.includes(id) || id === null) {
      this.#activeChatId = id
      this.#notify({ for: RENDER_COMPONENT.CHAT_EDITOR, data: { id } })
    }
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
        'An instance of HttpRequestManager is required to instantiate UserSetting!',
      )
    }

    if (!stateManager) {
      throw new Error(
        'An instance of StateManager is required to instantiate UserSetting!',
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

    // this.#modal = document.getElementById('new-chat-modal')
  }

  #modalManager = () => {
    // const modal = this.#modal
    const openButton = document.getElementById('open-new-chat-modal')
    const closeButton = document.getElementById('close-new-chat-modal')
    const cancelButton = document.getElementById('cancel-modal-btn')
    // const formContent = document.getElementById('modal-form-content')
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
            (item) => item.name !== this.#stateManager.me.name,
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
    modalBody.innerHTML = templates.modal.stepOneHtml()
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
        (item) => item === document.activeElement,
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

  constructor(httpRequestManager, stateManager) {
    if (!stateManager) {
      throw new Error(
        'An instance of StateManager is required to instantiate ChatsContainerRenderer!',
      )
    }

    if (!httpRequestManager) {
      throw new Error(
        'An instance of HttpRequestManager is required to instantiate ChatsContainerRenderer!',
      )
    }

    //
    this.#stateManager = stateManager
    this.#chatsContainer = document.getElementById('chats-container')
    this.#refineInput = document.getElementById('refine-input')
    this.#chats = []
    this.#refineString = ''

    //
    this.#chatsContainer.innerHTML = ''
    this.#refineInput.addEventListener('input', (event) => {
      this.#refineString = event.target.value?.trim() ?? ''
      this.#updateUI()
    })

    //
    httpRequestManager.GET({
      baseUrl: '/api/v1/chats',
      onComplete: (data) => {
        data.forEach((chat) => {
          chat.initial = 'GP'

          if (chat?.type?.name === 'direct') {
            const newMembers = chat.members.find(
              (item) => item.name !== this.#stateManager.me.name,
            )

            chat.members = [newMembers]
            chat.name = newMembers.name
            chat.avatarUrl = newMembers.avatarUrl
            chat.initial = undefined
          }

          stateManager.updateChats(chat)
        })
      },
      onError: (error) => {
        console.error('Fetching current user data failed :', error)
      },
    })
  }

  update = (payload) => {
    if (payload?.for !== RENDER_COMPONENT.CHATS_CONTAINER) return
    this.#chats = payload.data ?? []
    this.#updateUI()
  }

  #updateUI = () => {
    const renderedChats = this.#chats.filter((chat) => {
      if (!this.#refineString.trim()) return true
      return chat.name.includes(this.#refineString)
    })

    this.#chatsContainer.innerHTML = ''

    renderedChats.map((chat, index) => {
      const { id, name, initial, avatarUrl } = chat

      const chatButton = templates.createChatItem({ name, initial, avatarUrl })

      chatButton.addEventListener('click', () => {
        this.#stateManager.updateActiveChat(id)
        const activeChats = this.#chatsContainer.querySelectorAll(
          '.user-chat-item-active',
        )

        activeChats.forEach((item) => {
          item.classList.remove('user-chat-item-active')
        })

        chatButton.classList.add('user-chat-item-active')
      })

      if (this.#chatsContainer) {
        this.#chatsContainer.appendChild(chatButton)
      }

      return chatButton
    })
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
  #messages
  #socketClient
  #activeChatId
  #mainContainer

  constructor(socketClient) {
    if (!socketClient) {
      throw new Error(
        'An instance of SocketManager is required to instantiate ChatEditorRenderer!',
      )
    }

    //
    this.#socketClient = socketClient
    this.#messages = []
    this.#mainContainer = document.getElementById('main-container')
    this.#defaultView()
  }

  update = (payload) => {
    if (payload?.for !== RENDER_COMPONENT.CHAT_EDITOR) return
    const { id } = payload.data

    if (id === null) {
      this.#defaultView()
    }

    if (id !== null) {
      console.log({ id })
      this.#updateView()
    }
  }

  #defaultView = () => {
    this.#mainContainer.innerHTML = templates.defaultChatEditor()
  }

  #updateView = () => {
    const child = templates.chatEditor()
    this.#mainContainer.innerHTML = ''
    this.#mainContainer.appendChild(child)
  }
}

const httpRequestManager = new HttpRequestManager()
const stateManager = new StateManager(httpRequestManager)
const socketClient = new SocketManager()
socketClient.connect()

new DropDownRenderer()
new ChatModalRenderer(httpRequestManager, stateManager)

const chatEditorRenderer = new ChatEditorRenderer(socketClient)
const chatsContainerRenderer = new ChatsContainerRenderer(
  httpRequestManager,
  stateManager,
)

stateManager.subscribe(chatEditorRenderer)
stateManager.subscribe(chatsContainerRenderer)
