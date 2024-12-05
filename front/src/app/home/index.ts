import { httpRequestManager } from '@utils/httpManager/httpManager'
import { socketClient } from '@utils/socket/socketClient'

import styles from './index.module.scss'

const main = document.getElementById('body')!
main.innerHTML = `<div class="${styles.hello}">Hello World</div>`
console.log('Main App')
socketClient.connect()
const store = httpRequestManager.getStore()
console.log({ store })
