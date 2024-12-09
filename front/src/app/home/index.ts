import ChatList from '@components/ChatList'
import DropDown from '@components/DropDown'
import Modal from '@components/Modal'
import Profile from '@components/Profile'

import HttpRequestManager from '@utils/HttpManager'
import StateStore from '@utils/StateStore'

import '@styles/global.css'

import './home-aside.scss'
import './home-modal.scss'
import './index.scss'

const stateStore = StateStore.getInstance()
const httpRequestManager = HttpRequestManager.getInstance()

if (import.meta.env.DEV) {
  httpRequestManager.GET({
    resourcePath: '/api/v1/auth/check',
    onError: () => {
      window.location.href = '/templates/login'
    },
  })
}

new Profile(stateStore, httpRequestManager)
const chatList = new ChatList(stateStore, httpRequestManager)
new Modal(stateStore, httpRequestManager)
new DropDown()

stateStore.subscribe(chatList)

const logoutBtn = document.getElementById('logout-btn')
logoutBtn?.addEventListener('click', () => {
  httpRequestManager.POST({
    resourcePath: '/api/v1/auth/logout',
    body: {},
    onComplete: (data) => {
      console.log({ data })
      if (import.meta.env.DEV) {
        window.location.href = '/templates/login'
      } else {
        window.location.href = '/login'
      }
    },
    onError: (error) => {
      console.log({ error })
    },
  })
})
