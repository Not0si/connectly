const logOutBtn = document.getElementById('logOut')
const chatItems = document.getElementsByClassName('chat-item')
const main = document.getElementById('main')
const searchBox = document.getElementById('search-box')

logOutBtn.addEventListener('click', handleLogOut)

Array.from(chatItems).forEach((element) => {
  element.addEventListener('click', () => {
    main.classList.add('mobile-enabled')
  })
})

function handleLogOut() {
  console.log('Hi hi')
}

function userCardTemplate({ avatarUrl, userName, isOnline }) {
  return `
  <li class="chat-item">
      <aside class="chat-avatar" data-online="${isOnline}">
          <img src="${avatarUrl}" alt="User Image"/>
      </aside>
      <main class="chat-metadata">
          <header class="chat-metadata-header">
              <h2 class="chat-sender">${userName}</h2>
              <span class="chat-send-time">09:12 AM</span>
          </header>
          <p class="message-preview">hi dude what's up</p>
      </main>
  </li>
  `
}

async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error)
    return null
  }
}
