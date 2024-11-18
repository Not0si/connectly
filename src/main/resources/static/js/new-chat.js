import { debounce, fetcher, chatManager } from '/js/utils.js'

const openModalButton = document.getElementById('open-modal-btn')
const closeModalButton = document.getElementById('close-modal-btn')
const modalSection = document.getElementById('modal-section')
const userSearchBox = document.getElementById('user-search-box')
const usersList = document.getElementById('modal-main')

openModalButton.addEventListener('click', openModal)
closeModalButton.addEventListener('click', closeModal)

var currentPage = 0
var totalPages = 1
var searchBy = ''

function openModal() {
  fetchUsers()

  modalSection.classList.add('open-modal')
  userSearchBox.focus()
}

function closeModal() {
  modalSection.classList.remove('open-modal')
}

const loader = document.createElement('div')
loader.style.width = '100%'
loader.style.display = 'none'
loader.style.placeContent = 'center'
loader.className = 'loaderContainer'
loader.innerHTML = `
<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <circle class="spin" cx="400" cy="400" fill="none"
    r="200" stroke-width="50" stroke="#E387FF"
    stroke-dasharray="656 1400"
    stroke-linecap="round" />
</svg>
`

userSearchBox.addEventListener('input', (event) => {
  const userName = event.target.value.trim() ?? ''
  currentPage = 0
  totalPages = 1
  searchBy = userName

  debounce(() => {
    usersList.innerHTML = ''
    usersList.appendChild(loader)
    fetchUsers()
  }, 500)()
})

async function fetchUsers() {
  await fetcher.GET({
    baseUrl: '/api/v1/users',
    params: { username: searchBy, page: currentPage ?? 0, size: 8 },
    onFetching: () => {
      loader.style.display = 'grid'

      if (currentPage === 0 && totalPages === 1) {
        loader.style.height = '100px'
      } else {
        loader.style.height = '40px'
      }

      usersList.appendChild(loader)
    },
    onFetched: (data) => {
      loader.style.display = 'none'

      const users = data.content ?? []
      totalPages = data.totalPages ?? 1

      renderUsers(users)
    },
    onError: (error) => {
      console.error('Error while fetching', error)
    },
  })
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && currentPage < totalPages - 1) {
      currentPage++
      fetchUsers()
    }
  })
})

function renderUsers(usersData = []) {
  const domNodes = usersData.map((item) => {
    const { userName, avatarUrl } = item

    const listItem = document.createElement('li')
    listItem.className = 'user-item'
    listItem.innerHTML = `
      <img class="user-item-avatar" src="${avatarUrl}" alt="User Avatar"/> 
      <p class="user-item-name">${userName}</p>
      `
    listItem.addEventListener('click', () => {
      console.log('User Name:', userName)
    })

    usersList.appendChild(listItem)

    return listItem
  })

  if (domNodes.length > 0) {
    observer.disconnect()
    observer.observe(domNodes[domNodes.length - 1])
  }
}
