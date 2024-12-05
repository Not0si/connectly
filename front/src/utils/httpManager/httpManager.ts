type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestParams {
  method: RequestMethod
  baseUrl: string
  params?: Record<string, string>
  headers?: Record<string, string>
  body?: any
  onStart?: () => void
  onComplete?: (data: any) => void
  onError?: (error: any) => void
  onCacheResponse?: (data: any) => void
}

interface GetParams {
  baseUrl: string
  params?: Record<string, string>
  onStart?: () => void
  onComplete?: (data: any) => void
  onError?: (error: any) => void
}

interface PostPatchParams {
  baseUrl: string
  headers?: Record<string, string>
  body?: any
  onStart?: () => void
  onComplete?: (data: any) => void
  onError?: (error: any) => void
}

class HttpRequestManager {
  private store: Record<string, any> = {}

  private static instance: HttpRequestManager | undefined

  private constructor() {
    if (HttpRequestManager.instance) {
      return HttpRequestManager.instance
    }

    HttpRequestManager.instance = this
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
    baseUrl,
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

      const url = `${baseUrl}${queryString}`

      const options: RequestInit = {
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

  public async GET({
    baseUrl,
    params,
    onStart,
    onComplete,
    onError,
  }: GetParams): Promise<void> {
    const queryString =
      params ? `?${new URLSearchParams(params).toString()}` : ''

    const accessKey = queryString.trim().length ? queryString : 'base'

    if (!this.store[baseUrl]) {
      this.store[baseUrl] = {}
    }

    if (this.store[baseUrl][accessKey]) {
      const data = this.store[baseUrl][accessKey]
      if (onComplete) onComplete(data)
      return
    }

    await this.request({
      method: 'GET',
      baseUrl,
      params,
      onStart,
      onComplete,
      onError,
      onCacheResponse: (data) => {
        this.store[baseUrl][accessKey] = data
      },
    })
  }

  public async POST({
    baseUrl,
    headers,
    body,
    onStart,
    onComplete,
    onError,
  }: PostPatchParams): Promise<void> {
    await this.request({
      method: 'POST',
      baseUrl,
      headers,
      body,
      onStart,
      onComplete,
      onError,
    })
  }

  public async PATCH({
    baseUrl,
    headers,
    body,
    onStart,
    onComplete,
    onError,
  }: PostPatchParams): Promise<void> {
    await this.request({
      method: 'PATCH',
      baseUrl,
      headers,
      body,
      onStart,
      onComplete,
      onError,
    })
  }

  public async DELETE({
    baseUrl,
    params,
    onStart,
    onComplete,
    onError,
  }: GetParams): Promise<void> {
    await this.request({
      method: 'DELETE',
      baseUrl,
      params,
      onStart,
      onComplete,
      onError,
    })
  }
}

const httpRequestManager = HttpRequestManager.getInstance()

export { httpRequestManager }
