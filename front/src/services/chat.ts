import { ChatDTO, IChat, UserDTO } from '@interfaces/index'

import StateStore from '@utils/StateStore'

const stateStore = StateStore.getInstance()

export const constructChat = (item: ChatDTO): IChat | null => {
  const chat: IChat = item as IChat

  const me = stateStore.getCurrentUser()
  if (!me) return null

  chat.initial = 'GP'
  if (item.type?.name === 'direct') {
    const newMembers = chat.members.find(
      (item: any) => item.name !== (me as UserDTO).name,
    )

    if (!newMembers) return null

    chat.members = newMembers ? [newMembers] : []
    chat.name = newMembers.name
    chat.avatarUrl = newMembers.avatarUrl
    chat.initial = undefined
  }

  return chat
}
