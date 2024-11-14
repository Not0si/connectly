const openModalBtn = document.getElementById('open-modal-btn')
const closeModalBtn = document.getElementById('close-modal-btn')
const modalSection = document.getElementById('modal-section')
const chatItems = document.getElementsByClassName('chat-item')
const main = document.getElementById('main')
const searchBox = document.getElementById('search-box')
const userSearchBox = document.getElementById('user-search-box')

openModalBtn.addEventListener('click', toggleModal)
closeModalBtn.addEventListener('click', toggleModal)


async function fetchUsers(subString = ""){
 try {
            console.log({subString})
                // Replace with your API endpoint
            const response = await fetch(
                  `/api/v1/users?username=${subString}&page=0&size=10`
                )

                const data = await response.json()

                console.log({ data })
         } catch (error) {
            console.error('Error fetching data:', error)
    }
}

userSearchBox.addEventListener('input', (event) => {

 const userName = event.target.value.trim() ?? ""

 debounce(() => fetchUsers(userName),500)()
})

Array.from(chatItems).forEach((element) => {
  element.addEventListener('click', () => {
    main.classList.add('mobile-enabled')
  })
})

function toggleModal() {
  modalSection.classList.toggle('open-modal')
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




// Debounce function
var debounceTimeout;
function debounce  (func, delay)  {
  return function (...args) {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => func.apply(this, args), delay)
  }
}
