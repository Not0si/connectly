import { CreateChatRequestDTO } from '@interfaces/index'
import { constructChat } from '@services/chat'

import HttpRequestManager from '@utils/HttpManager'
import StateStore from '@utils/StateStore'

type ChatType = 'direct' | 'group'

interface ChatConfiguration {
  chatType: ChatType
  selectedUsers: Record<string, any>
  searchQuery: string
  groupDetails: {
    name: string
    description: string
  }
}

interface ModalConfiguration {
  currentStep: number
  searchDebounceTimer: number | null
  fetchedUsers: string[]
  searchQuery: string
  intersectionObserver: IntersectionObserver
}

interface PaginationState {
  currentPage: number
  totalPages: number
}

interface ModalElements {
  modalContainer: HTMLElement
  contentContainer: HTMLElement
  submitButton: HTMLButtonElement
  openButton: HTMLButtonElement
  closeButton: HTMLButtonElement
  cancelButton: HTMLButtonElement
}

class Modal {
  private stateStore: StateStore
  private httpRequestManager: HttpRequestManager
  private modalElements: ModalElements
  private modalConfiguration!: ModalConfiguration
  private chatConfiguration!: ChatConfiguration
  private paginationState!: PaginationState
  private usersList: HTMLElement | null = null

  constructor(stateStore: StateStore, httpRequestManager: HttpRequestManager) {
    this.stateStore = stateStore
    this.httpRequestManager = httpRequestManager

    this.modalElements = {
      modalContainer: document.getElementById('new-chat-modal')!,
      contentContainer: document.getElementById('modal-form-content')!,
      submitButton: document.getElementById(
        'submit-modal-btn',
      )! as HTMLButtonElement,
      openButton: document.getElementById(
        'open-new-chat-modal',
      )! as HTMLButtonElement,
      closeButton: document.getElementById(
        'close-new-chat-modal',
      )! as HTMLButtonElement,
      cancelButton: document.getElementById(
        'cancel-modal-btn',
      )! as HTMLButtonElement,
    }

    this.resetForm()
    this.initializeEventListeners()
  }

  private resetForm() {
    this.modalConfiguration = {
      currentStep: 1,
      searchDebounceTimer: null,
      fetchedUsers: [],
      intersectionObserver: new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const havePageToFetch =
            this.paginationState.currentPage <
            this.paginationState.totalPages - 1

          if (entry.isIntersecting && havePageToFetch) {
            this.paginationState.currentPage++
            this.fetchUsers()
          }
        })
      }),
      searchQuery: '',
    }

    this.chatConfiguration = {
      chatType: 'direct',
      selectedUsers: {},
      searchQuery: '',
      groupDetails: {
        name: '',
        description: '',
      },
    }

    this.paginationState = {
      currentPage: 0,
      totalPages: 1,
    }

    this.renderStepOne()
  }

  private initializeEventListeners() {
    this.modalElements.closeButton.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        event.preventDefault()

        if (event.key === 'Tab' && event.shiftKey) {
          this.modalElements.submitButton.focus()
        }
      },
    )

    this.modalElements.submitButton.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        event.preventDefault()

        if (event.key === 'Tab' && !event.shiftKey) {
          this.modalElements.closeButton.focus()
        }
      },
    )

    this.modalElements.submitButton.addEventListener('click', (event) => {
      event.preventDefault()

      switch (this.modalConfiguration.currentStep) {
        case 1:
          this.modalConfiguration.currentStep = 2
          this.renderStepTwo()

          if (this.chatConfiguration.chatType === 'direct') {
            this.modalElements.submitButton.innerText = 'Submit'
          }

          this.modalElements.submitButton.disabled = true
          break

        case 2:
          if (this.chatConfiguration.chatType === 'direct') {
            this.createChat()
            break
          }

          if (this.chatConfiguration.chatType === 'group') {
            this.modalConfiguration.currentStep = 3
            this.renderStepThree()
            this.modalElements.submitButton.innerText = 'Submit'
            this.modalElements.submitButton.disabled = true
            break
          }

          break

        case 3:
          this.createChat()
          break

        default:
          break
      }
    })

    this.modalElements.openButton.addEventListener('click', () => {
      this.modalElements.modalContainer.classList.add('open-modal')
      this.resetForm()
    })

    this.modalElements.closeButton.addEventListener('click', () => {
      this.modalElements.modalContainer.classList.remove('open-modal')
    })

    this.modalElements.cancelButton.addEventListener('click', () => {
      this.modalElements.modalContainer.classList.remove('open-modal')
    })
  }

  private fetchUsers = async () => {
    await this.httpRequestManager.GET({
      resourcePath: '/api/v1/users',
      params: {
        username: this.modalConfiguration.searchQuery,
        page: `${this.paginationState.currentPage ?? 0}`,
        size: '8',
      },
      onStart: () => {
        console.log('Fetching')
      },
      onComplete: (data) => {
        const users = data?.content ?? []
        this.paginationState.totalPages = data?.totalPages ?? 1
        this.renderUserList(users)
      },
      onError: (error) => {
        console.error('Error while fetching', error)
      },
    })
  }

  private debounce(func: any, delay: number) {
    return (...args: any[]) => {
      if (this.modalConfiguration.searchDebounceTimer !== null) {
        clearTimeout(this.modalConfiguration.searchDebounceTimer)
      }

      this.modalConfiguration.searchDebounceTimer = window.setTimeout(
        () => func(...args),
        delay,
      )
    }
  }

  private renderStepOne() {
    this.modalElements.submitButton.innerText = 'Next'
    this.modalElements.submitButton.disabled = false

    const labelDirectChat = `
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
                    A private chat between you and the user you choose to connect with.
                </p>
            </div>
            <input type="radio" name="chatType" value="direct" />
        </label>
    `

    const labelGroupChat = `
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
                    A shared chat where you can talk with multiple users in a group.
                </p>
            </div>
            <input type="radio" name="chatType" value="group" />
        </label>
    `

    // Render content
    const contentContainer = this.modalElements.contentContainer
    if (contentContainer) {
      contentContainer.innerHTML = labelDirectChat + labelGroupChat

      // Select radio inputs
      const radioInputs = contentContainer.querySelectorAll<HTMLInputElement>(
        'input[name="chatType"]',
      )

      if (radioInputs.length > 0) {
        // Set default selection
        radioInputs[0].checked = true
        radioInputs[0].focus()
      }

      // Add change event listeners
      radioInputs.forEach((input) => {
        input.addEventListener('change', (event) => {
          const target = event.target as HTMLInputElement
          this.chatConfiguration.chatType = target.value as 'direct' | 'group'
        })
      })
    }
  }

  private renderStepTwo = () => {
    const formContent = this.modalElements.contentContainer

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
      this.chatConfiguration.searchQuery =
        (event.target as HTMLInputElement).value ?? ''
      this.paginationState.currentPage = 0
      this.paginationState.totalPages = 1

      this.debounce(() => {
        if (this.modalConfiguration.fetchedUsers && this.usersList) {
          this.usersList.innerHTML = ''
        }

        this.fetchUsers()
      }, 500)()
    })

    this.usersList = usersList

    this.fetchUsers()
  }

  private renderStepThree = () => {
    this.modalElements.contentContainer.innerHTML = `
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

    const nameInput =
      this.modalElements.contentContainer.querySelector('#group-name')!
    const descriptionInput =
      this.modalElements.contentContainer.querySelector('#group-description')!

    nameInput.addEventListener('input', (event) => {
      const value = (event.target as HTMLInputElement).value ?? ''

      this.chatConfiguration.groupDetails.name = value

      if (value.length >= 6) {
        this.modalElements.submitButton.disabled = false
      } else {
        this.modalElements.submitButton.disabled = true
      }
    })

    descriptionInput.addEventListener('input', (event) => {
      const value = (event.target as HTMLInputElement).value ?? ''
      this.chatConfiguration.groupDetails.description = value
    })
  }

  private renderUserList = (usersData = []) => {
    if (!this.usersList) return

    const listNodes = usersData.map(({ name, avatarUrl }, index) => {
      const listItem = this.createUserListItem(name, avatarUrl, index)
      this.usersList!.appendChild(listItem)
      return listItem
    })

    this.usersList.addEventListener('keydown', (event) => {
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
      this.modalConfiguration.intersectionObserver.disconnect()
      this.modalConfiguration.intersectionObserver.observe(
        listNodes[listNodes.length - 1],
      )
    }

    //
  }

  private createUserListItem = (
    name: string,
    avatarUrl: string,
    index?: number,
  ) => {
    const listItem = document.createElement('button')
    listItem.type = 'button'
    if (index !== 0) {
      listItem.tabIndex = -1
    }

    const isActive = Object.keys(
      this.chatConfiguration.selectedUsers ?? {},
    ).includes(name)
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

    listItem.addEventListener('click', (event) => {
      const listItem = (event.target as HTMLElement).closest(
        '.user-item',
      ) as HTMLElement

      if (!listItem) return

      const name = listItem.getAttribute('name')

      if (!name) return

      if (this.chatConfiguration.chatType === 'direct') {
        this.handleDirectChatSelection(name, listItem)
      } else if (this.chatConfiguration.chatType === 'group') {
        this.handleGroupChatSelection(name, listItem)
      }

      if (!Object.keys(this.chatConfiguration.selectedUsers).length) {
        this.modalElements.submitButton.disabled = true
      } else {
        this.modalElements.submitButton.disabled = false
      }
    })
    return listItem
  }

  private handleDirectChatSelection = (name: string, listItem: HTMLElement) => {
    if (this.chatConfiguration.selectedUsers[name]) {
      listItem.classList.remove('active-member')
      this.chatConfiguration.selectedUsers = {}
    } else {
      if (!this.usersList) return
      // Clear all active members
      this.usersList
        .querySelectorAll('.active-member')
        .forEach((item) => item.classList.remove('active-member'))

      // Mark the current item as active and update selected members
      listItem.classList.add('active-member')
      this.chatConfiguration.selectedUsers = {
        [name]: { node: listItem, name },
      }
    }
  }

  private handleGroupChatSelection = (name: string, listItem: HTMLElement) => {
    if (this.chatConfiguration.selectedUsers[name]) {
      listItem.classList.remove('active-member')
      const { [name]: _, ...restItems } = this.chatConfiguration.selectedUsers
      this.chatConfiguration.selectedUsers = restItems
    } else {
      listItem.classList.add('active-member')
      this.chatConfiguration.selectedUsers[name] = { node: listItem, name }
    }
  }

  private createChat = () => {
    const owner = this.stateStore.getCurrentUser()?.name

    if (!owner) return

    const payload: CreateChatRequestDTO = {
      name:
        this.chatConfiguration.chatType === 'direct' ?
          undefined
        : this.chatConfiguration.groupDetails.name,
      description:
        this.chatConfiguration.chatType === 'direct' ?
          undefined
        : this.chatConfiguration.groupDetails.name,
      type: this.chatConfiguration.chatType,
      owner: owner,
      members: Object.keys(this.chatConfiguration.selectedUsers),
    }

    this.httpRequestManager.POST({
      resourcePath: '/api/v1/chats',
      body: payload,
      onStart: () => {
        this.modalElements.submitButton.disabled = true
      },
      onComplete: (response) => {
        const chat = constructChat(response)
        if (chat) this.stateStore.addChat(chat)

        this.modalElements.modalContainer.classList.remove('open-modal')
      },
    })
  }
}

export default Modal
