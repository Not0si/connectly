import HttpRequestManager from '@utils/HttpManager'

import '@styles/global.css'

import './login.scss'

interface LoginFormData {
  username: string
  password: string
}

const httpRequestManager = HttpRequestManager.getInstance()

if (import.meta.env.DEV) {
  httpRequestManager.GET({
    resourcePath: '/api/v1/auth/check',
    onComplete: (data) => {
      console.log({ data })
      window.location.href = '/templates/'
    },
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector<HTMLFormElement>('.login-form')
  if (!loginForm) {
    console.error('Login form not found')
    return
  }

  loginForm.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(loginForm)
    const data: LoginFormData = Object.fromEntries(
      formData,
    ) as unknown as LoginFormData

    httpRequestManager.POST({
      resourcePath: '/api/v1/auth/login',
      body: data,
      onComplete: () => {
        if (import.meta.env.DEV) {
          window.location.href = '/templates/'
        } else {
          window.location.href = '/chat'
        }
      },
      onError: (error) => {
        console.log({ error })
      },
    })
  })
})
