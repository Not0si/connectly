import { ChatDTO, Observer } from '@interfaces/index'
import { constructChat } from '@services/chat'

import HttpRequestManager from '@utils/HttpManager'
import StateStore from '@utils/StateStore'

interface ChatItemParams {
  name?: string
  initial?: string
  avatarUrl?: string
  messageTime?: string
  messageValue?: string
}

class ChatList implements Observer {
  private chatsContainer: HTMLElement
  private refineInput: HTMLInputElement
  private chats: any[]
  private refineString: string
  private stateStore: StateStore
  private httpRequestManager: HttpRequestManager

  constructor(stateStore: StateStore, httpRequestManager: HttpRequestManager) {
    this.stateStore = stateStore
    this.httpRequestManager = httpRequestManager
    this.chats = []
    this.refineString = ''
    this.chatsContainer = document.getElementById('chats-container')!
    this.refineInput = document.getElementById(
      'refine-input',
    )! as HTMLInputElement

    //

    this.chatsContainer.innerHTML = ''
    this.refineInput.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement
      this.refineString = target.value?.trim() ?? ''
      this.renderUI()
    })
  }

  public update(_data: any) {
    this.getUserChats()
  }
  // update = (payload) => {
  //   if (payload?.for !== RENDER_COMPONENT.CHATS_CONTAINER) return
  //   this.chats = payload.data ?? []
  //   this.renderUI()
  // }

  private renderUI = () => {
    const renderedChats = this.chats.filter((chat) => {
      if (!this.refineString.trim()) return true
      return chat.name.includes(this.refineString)
    })

    this.chatsContainer.innerHTML = ''

    renderedChats.map((chat) => {
      const { id, name, initial, avatarUrl } = chat

      const chatButton = this.createChatItem({ name, initial, avatarUrl })

      chatButton.addEventListener('click', () => {
        this.stateStore.updateActiveChat(id)
        const activeChats = this.chatsContainer.querySelectorAll(
          '.user-chat-item-active',
        )

        activeChats.forEach((item) => {
          item.classList.remove('user-chat-item-active')
        })

        chatButton.classList.add('user-chat-item-active')
      })

      if (this.chatsContainer) {
        this.chatsContainer.appendChild(chatButton)
      }

      return chatButton
    })
  }

  private createChatItem({
    name,
    initial,
    avatarUrl,
    messageTime,
    messageValue,
  }: ChatItemParams): HTMLButtonElement {
    const listItem = document.createElement('button')
    listItem.className = 'user-chat-item'
    listItem.tabIndex = 0

    if (initial) {
      listItem.innerHTML = `
      <div class="user-chat-item-avatar user-chat-item-initial">${initial}</div>
      <div class="user-chat-item-details">
        <div class="user-chat-item-header">
          <h4>
            ${name ?? 'Unknown'}
          </h4>
          <span class="time">
            ${messageTime ?? '0s'}
          </span>
        </div>
        <p class="last-message">
          ${messageValue ?? 'Start new conversation'}
        </p>
      </div>
    `
    }

    if (avatarUrl) {
      listItem.innerHTML = `
      <img src="${avatarUrl}" alt="Contact" class="user-chat-item-avatar" />
      <div class="user-chat-item-details">
        <div class="user-chat-item-header">
          <h4>
            ${name ?? 'Unknown'}
          </h4>
          <span class="time">
            ${messageTime ?? '0s'}
          </span>
        </div>
        <p class="last-message">
          ${messageValue ?? 'Start new conversation'}
        </p>
      </div>
    `
    }

    return listItem
  }

  private getUserChats() {
    this.httpRequestManager.GET({
      resourcePath: '/api/v1/chats',
      onComplete: (data) => {
        data.forEach((item: ChatDTO) => {
          const chat = constructChat(item)

          if (chat) this.stateStore.addChat(chat)
        })
      },
      onError: (error) => {
        console.error('Fetching current user data failed :', error)
      },
    })
  }
}

export default ChatList
