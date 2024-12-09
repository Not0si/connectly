type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestParams {
  method: RequestMethod
  resourcePath: string
  params?: Record<string, string>
  headers?: Record<string, string>
  body?: any
  onStart?: () => void
  onComplete?: (data: any) => void
  onError?: (error: any) => void
  onCacheResponse?: (data: any) => void
}

interface GetParams {
  resourcePath: string
  params?: Record<string, string>
  onStart?: () => void
  onComplete?: (data: any) => void
  onError?: (error: any) => void
}

interface PostPatchParams {
  resourcePath: string
  headers?: Record<string, string>
  body?: any
  onStart?: () => void
  onComplete?: (data: any) => void
  onError?: (error: any) => void
}

class HttpRequestManager {
  private baseURL: string = import.meta.env.VITE_API_URL
  private store: Record<string, any>

  private static instance: HttpRequestManager | undefined

  private constructor() {
    this.store = {}
  }

  static getInstance(): HttpRequestManager {
    if (!HttpRequestManager.instance) {
      HttpRequestManager.instance = new HttpRequestManager()
    }
    return HttpRequestManager.instance
  }

  public getStore(): Record<string, Record<string, any>> {
    const result = structuredClone(this.store)

    return result
  }

  private request = async ({
    method,
    resourcePath,
    params = {},
    headers = {},
    body,
    onStart,
    onComplete,
    onError,
    onCacheResponse,
  }: RequestParams): Promise<void> => {
    try {
      if (onStart) onStart()

      const queryString =
        Object.keys(params).length ?
          `?${new URLSearchParams(params).toString()}`
        : ''

      const url = `${this.baseURL}${resourcePath}${queryString}`

      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        credentials: 'include',
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

  public async GET({
    resourcePath,
    params,
    onStart,
    onComplete,
    onError,
  }: GetParams): Promise<void> {
    const queryString =
      params ? `?${new URLSearchParams(params).toString()}` : ''

    const accessKey = queryString.trim().length ? queryString : 'base'

    if (!this.store[resourcePath]) {
      this.store[resourcePath] = {}
    }

    if (this.store[resourcePath][accessKey]) {
      const data = this.store[resourcePath][accessKey]
      if (onComplete) onComplete(data)
      return
    }

    await this.request({
      method: 'GET',
      resourcePath,
      params,
      onStart,
      onComplete,
      onError,
      onCacheResponse: (data) => {
        this.store[resourcePath][accessKey] = data
      },
    })
  }

  public async POST({
    resourcePath,
    headers,
    body,
    onStart,
    onComplete,
    onError,
  }: PostPatchParams): Promise<void> {
    await this.request({
      method: 'POST',
      resourcePath,
      headers,
      body,
      onStart,
      onComplete,
      onError,
    })
  }

  public async PATCH({
    resourcePath,
    headers,
    body,
    onStart,
    onComplete,
    onError,
  }: PostPatchParams): Promise<void> {
    await this.request({
      method: 'PATCH',
      resourcePath,
      headers,
      body,
      onStart,
      onComplete,
      onError,
    })
  }

  public async DELETE({
    resourcePath,
    params,
    onStart,
    onComplete,
    onError,
  }: GetParams): Promise<void> {
    await this.request({
      method: 'DELETE',
      resourcePath,
      params,
      onStart,
      onComplete,
      onError,
    })
  }
}

export default HttpRequestManager
