const chatList = document.getElementById('chat-list')

var debounceTimeout

function debounce(func, delay) {
  return (...args) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => func.apply(this, args), delay)
  }
}

class Fetcher {
  constructor() {
    this.store = {}
  }

  logStore() {
    console.log({ store: this.store })
  }

  _request = async ({
    method,
    baseUrl,
    params = {},
    headers = {},
    body,
    onFetching,
    onFetched,
    onError,
    onCacheResponse,
  }) => {
    try {
      if (onFetching) onFetching()

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

      if (onCacheResponse) onCacheResponse(baseUrl, queryString, data)

      if (onFetched) onFetched(data)
    } catch (error) {
      if (onError) onError(error)
    }
  }

  GET = async ({ baseUrl, params, onFetching, onFetched, onError }) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : ''

    if (!this.store[baseUrl]) {
      this.store[baseUrl] = {}
    }

    if (this.store[baseUrl][queryString ?? 'base']) {
      const data = this.store[baseUrl][queryString ?? 'base']
      if (onFetched) onFetched(data)
      return
    }

    await this._request({
      method: 'GET',
      baseUrl,
      params,
      onFetching,
      onFetched,
      onError,
      onCacheResponse: (baseUrl, queryString, data) => {
        this.store[baseUrl][queryString ?? 'base'] = data
      },
    })
  }

  POST = async ({ baseUrl, headers, body, onFetching, onFetched, onError }) => {
    await this._request({
      method: 'POST',
      baseUrl,
      headers,
      body,
      onFetching,
      onFetched,
      onError,
    })
  }

  PATCH = async ({
    baseUrl,
    headers,
    body,
    onFetching,
    onFetched,
    onError,
  }) => {
    await this._request({
      method: 'PATCH',
      baseUrl,
      headers,
      body,
      onFetching,
      onFetched,
      onError,
    })
  }

  DELETE = async ({ baseUrl, params, onFetching, onFetched, onError }) => {
    await this._request({
      method: 'DELETE',
      baseUrl,
      params,
      onFetching,
      onFetched,
      onError,
    })
  }
}

class ChatManager {
  constructor() {
    this.chats = []
  }

  addChats = () => {}

  addChat = () => {}

  updateChatMetadata = () => {}
}

const fetcher = new Fetcher()
const chatManager = new ChatManager()

export { fetcher, debounce, chatManager }
