export const SUBSCRIBER_ID = Object.freeze({
  CHATS_CONTAINER: 'CHATS_CONTAINER',
  CHAT_EDITOR: 'CHAT_EDITOR',
} as const)

export type SubscriberId = (typeof SUBSCRIBER_ID)[keyof typeof SUBSCRIBER_ID]
