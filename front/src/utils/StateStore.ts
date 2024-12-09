import { SUBSCRIBER_ID } from '@enums/index'
import { IChat, INotification, Observer, UserDTO } from '@interfaces/index'

class StateStore {
  private static instance: StateStore | null = null
  private chats: IChat[]
  private currentUser: UserDTO | null = null
  private chatsIds: number[]
  private observers: Observer[]

  private constructor() {
    this.observers = []
    this.chats = []
    this.chatsIds = []
  }

  static getInstance(): StateStore {
    if (!StateStore.instance) {
      StateStore.instance = new StateStore()
    }
    return StateStore.instance
  }

  public getCurrentUser(): UserDTO | null {
    return structuredClone(this.currentUser)
  }

  public setCurrentUser(value: UserDTO) {
    this.currentUser = value
  }

  public addChat(chat: IChat): void {
    const isExist = this.chats.find((item) => item.id === chat.id)

    if (!isExist) {
      this.chatsIds = [...this.chatsIds, chat.id]
      this.chats = [chat, ...this.chats]
      this.notify({
        subscriberId: SUBSCRIBER_ID.CHATS_CONTAINER,
        data: this.chats,
      })
    }
  }

  public updateActiveChat(id: number | null): void {
    if (this.chatsIds.includes(id!) || id === null) {
      // this.activeChatId = id
      this.notify({ subscriberId: SUBSCRIBER_ID.CHAT_EDITOR, data: { id } })
    }
  }

  private notify(data: INotification): void {
    this.observers.forEach((observer) => {
      if (typeof observer.update === 'function') {
        observer.update(data)
      } else {
        console.warn('Observer does not have an update method:', observer)
      }
    })
  }

  public subscribe(observer: Observer): void {
    this.observers.push(observer)
  }
}

export default StateStore
