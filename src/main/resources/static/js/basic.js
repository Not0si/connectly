const chatItems = document.getElementsByClassName('chat-item')
const main = document.getElementById('main')
const searchBox = document.getElementById('search-box')

Array.from(chatItems).forEach((element) => {
  element.addEventListener('click', () => {
    main.classList.add('mobile-enabled')
  })
})

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

// Debounce function
