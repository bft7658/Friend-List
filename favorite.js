const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"

const dataPanel = document.querySelector('#data-panel')
const searchInput = document.querySelector('#search-input')

// 用來存放電影資料的容器
const friends = JSON.parse(localStorage.getItem('favoriteFriends'))
// 用來存放搜尋電影結果的容器
let filteredFriends = []

// 在按鈕設監聽
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-friend')) {
    showFriendModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

// 在 search bar 設監聽，建立即時顯示搜尋結果
searchInput.addEventListener('input', function onSearchFormSubmitted() {
  const keyword = searchInput.value.trim().toLowerCase()
  filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(keyword) || friend.surname.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredFriends.length === 0) {
    searchInput.value = ''
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderFriendList(filteredFriends)
})

// 將 api 取得的資料渲染出來
function renderFriendList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3 mb-3">
    <div class="mb-2">
      <div class="card visible">
        <img src="${item.avatar}" 
          data-bs-toggle="modal" 
          data-bs-target="#friend-modal"
          data-id="${item.id}"
          class="card-img-top btn-show-friend" alt="Friend Poster">
        <div class="card-body d-flex justify-content-between">
          <div class="card-title">${item.name}</div>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// 用資料的 id 將特定電影資料渲染到 modal
function showFriendModal(id) {
  const modalName = document.querySelector('#friend-modal-name')
  const modalBody = document.querySelector('#friend-modal-body')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    modalName.innerText = `${data.name} ${data.surname}`
    modalBody.innerHTML = `
     <img src = "${data.avatar}" alt = "Friend Avatar" class="image-avatar d-block mx-auto mb-4 rounded " >
        <div class="d-flex flex-column justify-content-center align-items-center">
          <p> <i class="fa fa-user  mr-1" style="color: #6c757d" aria-hidden="true"></i> 
            <span id="friend-modal-gender"> ${data.gender} </span>｜
            <span id="friend-modal-age"> ${data.age} </span> 
          </p>
          <p> <i class="fa fa-globe mr-1" style="color: #6c757d" aria-hidden="true"></i>
            <span id="friend-modal-region"> ${data.region} </span>
          </p>
          <p id="friend-modal-birthday"> <i class="fa fa-birthday-cake mr-1" style="color: #6c757d" aria-hidden="true"></i>
            ${data.birthday}
          </p>
          <p id="friend-modal-email"><a href="mailto:someone@example.com" style="text-decoration: none; color: inherit"><i class="fa fa-envelope mr-1" style="color: #6c757d"
              aria-hidden="true"></i> ${data.email} </a></p>
        </div>
    `
  }).catch((error) => console.log(error))
}

// 此處設計刪除我的最愛
function removeFromFavorite(id) {
  if (!friends || !friends.length) return
  const friendIndex = friends.findIndex(friend => friend.id === id)
  // 為了在搜尋頁面也可以刪除，要找到刪除對象在搜尋頁的 index，所以要將 friends 改成 filteredFriends
  const filteredIndex = filteredFriends.findIndex(friend => friend.id === id)
  // 找不到這部電影
  if (friendIndex === -1) return
  // 刪除該筆電影
  friends.splice(friendIndex, 1)
  filteredFriends.splice(filteredIndex, 1)
  // 存回 local storage
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))
  renderFriendList(friends)
  if (filteredFriends.length) {
    renderFriendList(filteredFriends)
  }
}
renderFriendList(friends)