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
