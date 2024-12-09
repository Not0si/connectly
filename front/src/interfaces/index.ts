import { SubscriberId } from '@enums/index'

export interface UserDTO {
  id: number
  name: string
  avatarUrl: string
  joinedAt: string
}

export interface Observer {
  update: (data: any) => void
}

export interface CreateChatRequestDTO {
  type: string
  owner: string
  name?: string
  description?: string
  members: string[]
}

interface ISimpleRecord {
  id: number
  name: string
}

interface ChatDTOUser {
  id: number
  name: string
  avatarUrl: string
  role: ISimpleRecord
}

export interface ChatDTO {
  id: number
  name: string
  description: string | null
  createdBy: UserDTO
  type: ISimpleRecord
  members: ChatDTOUser[]
}

export interface IChat extends ChatDTO {
  avatarUrl: string
  initial?: string
}

export interface INotification {
  subscriberId: SubscriberId
  data: Record<string, any> | any[]
}
