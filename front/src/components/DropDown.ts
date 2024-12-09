import '@styles/dropdown.scss'

class DropDown {
  constructor() {
    this.dropdownConfig()
  }

  private dropdownConfig() {
    const dropdowns = document.querySelectorAll('.dropdown')

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector('.dropbtn')
      const menu = dropdown.querySelector('.dropdown-content')

      if (!button || !menu) {
        return
      }

      const menuItems = Array.from(menu.querySelectorAll('.drop-item'))

      const clickOutside = (event: MouseEvent) => {
        if (dropdown && !dropdown.contains(event.target as Node)) {
          menu.classList.remove('drop-open')
        }
      }

      button.addEventListener('click', (event) => {
        if (menu.classList.contains('drop-open')) {
          menu.classList.remove('drop-open')
          window.removeEventListener('click', clickOutside)
        } else {
          menu.classList.add('drop-open')
          window.addEventListener('click', clickOutside)
        }

        event.stopPropagation()
      })

      menuItems.forEach((item) => {
        item.addEventListener('click', () => {
          menu.classList.remove('drop-open')
        })
      })

      //
    })
  }
}

export default DropDown
