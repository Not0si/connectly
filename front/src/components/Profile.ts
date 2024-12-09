import { UserDTO } from '@interfaces/index'

import HttpRequestManager from '@utils/HttpManager'
import StateStore from '@utils/StateStore'

class Profile {
  constructor(stateStore: StateStore, httpRequestManager: HttpRequestManager) {
    httpRequestManager.GET({
      resourcePath: '/api/v1/users/me',
      onComplete: (data: UserDTO) => {
        stateStore.setCurrentUser(data)

        this.updateUserProfile(data.name, data.avatarUrl)
      },
      onError: (error: any) => {
        console.error('Fetching current user data failed:', error)
      },
    })
  }

  private updateUserProfile(userName: string, userAvatar: string) {
    const imgContainer = document.getElementById('profile-img-container')!
    const name = document.getElementById('profile-name')!

    const imageElement = document.createElement('img')
    imageElement.className = 'profile-img'

    name.innerHTML = userName ?? 'Unknown'
    imageElement.src =
      userAvatar ??
      'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png'

    imgContainer.appendChild(imageElement)
    //

    name.classList.remove('pulsate')
    imgContainer.classList.remove('pulsate')
  }
}

export default Profile
