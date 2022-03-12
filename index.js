const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const FRIEND_PER_PAGE = 20


const dataPanel = document.querySelector('#data-panel')
// const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 用來存放所有好友資料的容器
const friends = []
// 用來存放搜尋好友結果的容器
let filteredFriends = []
// 預設初始頁面顯示在第一頁
let currentPage = 1

// 取得資料，
axios.get(INDEX_URL).then((response) => {
  friends.push(...response.data.results)
  // 將電影的數量放進去，讓 renderPaginator() 計算要分出幾個分頁
  renderPaginator(friends.length)
  // 串接 API 拿到電影總清單 movies 以後 ，不要一口氣全部輸出，只要顯示第 1 頁的資料就好
  renderFriendList(getFriendByPage(currentPage))
}).catch((error) => console.log(error))

// 在按鈕設監聽
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const id = Number(event.target.dataset.id)
  const target = event.target
  if (target.matches('.btn-show-friend')) {
    showFriendModal(id)
  } else if (target.matches('.btn-add-favorite')) {
    addToFavorite(id)
    // 符合條件，所以移除 + 符號
    target.remove()
    // 經由 favoriteButtonHTML 的判斷，加上 ♥ 符號
    parent.innerHTML += favoriteButtonHTML(id)
  } else if (target.matches(".btn-remove-favorite")) {
    cancelFromHome(id)
    // 符合條件，所以移除 ♥ 符號
    target.remove()
    // 經由 favoriteButtonHTML 的判斷，加上 + 符號
    parent.innerHTML += favoriteButtonHTML(id)
  }
  renderFriendList(getFriendByPage(currentPage))
})

// 建立即時顯示搜尋結果
searchInput.addEventListener('input', function onSearchFormSubmitted() {
  const keyword = searchInput.value.trim().toLowerCase()
  filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(keyword) || friend.surname.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredFriends.length === 0) {
    searchInput.value = ''
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  // 當我在其他頁面(非第一頁)進行搜尋時，我的搜尋結果會從第一頁開始，避免搜尋出空頁面，所以將 currentPage 重新設回第一頁
  currentPage = 1
  // 重製分頁器
  renderPaginator(filteredFriends.length)
  renderFriendList(getFriendByPage(currentPage))
})

// 在 paginator 設監聽
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果被點擊的不是 <a> 標籤，就不做任何動作
  if (event.target.tagName !== 'A') return
  // 透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page)
  // 判斷是一般瀏覽畫面還是搜尋畫面的頁碼
  renderPaginator(filteredFriends.length !== 0 ? filteredFriends.length : friends.length)
  // 根據指定的分頁重新渲染畫面
  renderFriendList(getFriendByPage(currentPage))
})


// 將 api 取得的資料渲染出來，這裡重新修改成卡片模式，然後判斷好友有沒有在我的最愛清單裡，
// function renderFriendList(data) {
//   let rawHTML = ''
//   data.forEach(item => {
//     const id = item.id
//     const favoriteFriends = JSON.parse(localStorage.getItem("favoriteFriends")) || []
//     if (favoriteFriends.some(friend => friend.id === id)) {
//       rawHTML += `<div class="col-sm-3 mb-3">
//     <div class="mb-2">
//       <div class="card visible">
//         <img src="${item.avatar}" 
//           data-bs-toggle="modal" 
//           data-bs-target="#friend-modal"
//           data-id="${item.id}"
//           class="card-img-top btn-show-friend" alt="Friend Poster">
//         <div class="card-body d-flex justify-content-between">
//           <div class="card-title">${item.name}</div>
//           <button type="button" class="btn btn-danger btn-size btn-remove-favorite fa fa-heart" data-id="${id}"></button>
//         </div>
//       </div>
//     </div>
//   </div>`
//     } else {
//       rawHTML += `<div class="col-sm-3 mb-3">
//     <div class="mb-2">
//       <div class="card">
//         <img src="${item.avatar}" 
//           data-bs-toggle="modal" 
//           data-bs-target="#friend-modal"
//           data-id="${item.id}"
//           class="card-img-top btn-show-friend" alt="Friend Poster">
//         <div class="card-body d-flex justify-content-between">
//           <div class="card-title">${item.name}</div>
//           <button type="button" class="btn btn-info btn-size btn-add-favorite" data-id="${id}">+</button>
//         </div>
//       </div>
//     </div>
//   </div>`
//     }

//   })
//   dataPanel.innerHTML = rawHTML
// }

function renderFriendList(data) {
  let rawHTML = ''
  data.forEach(item => {
    const id = item.id
    const favoriteFriends = JSON.parse(localStorage.getItem("favoriteFriends")) || []
    const className = favoriteFriends.some((friend) => friend.id === id) ? 'visible' : ''
    rawHTML += `<div class="col-sm-3 mb-3">
    <div class="mb-2">
      <div class="card ${className}">
        <img src="${item.avatar}" 
          data-bs-toggle="modal" 
          data-bs-target="#friend-modal"
          data-id="${id}"
          class="card-img-top btn-show-friend" alt="Friend Poster">
        <div class="card-body d-flex justify-content-between">
          <div class="card-title">${item.name}</div>
          ${favoriteButtonHTML(id)}
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// 參考別人做法，讓蒐藏電影的按鈕可以改變 
function favoriteButtonHTML(id) {
  // 用來檢查是否已經有儲存影片了，我的程式之前就是少了這項判斷，所以重整頁面時，蒐藏的按鈕會一直跑會預設圖示(例如點擊完變成 X 符號，但一重整頁面又變回 + 符號)
  const favoriteFriends = JSON.parse(localStorage.getItem("favoriteFriends")) || []
  let btnHTML = ''

  if (!favoriteFriends.some((friend) => friend.id === id)) {
    // 蒐藏電影清單裡沒有這部電影，所以主頁的蒐藏按鈕依然呈現加號
    btnHTML = `<button type="button" class="btn btn-info btn-size btn-add-favorite" data-id="${id}">+</button>`
  } else {
    // 蒐藏電影清單裡有這部電影，所以主頁的蒐藏按鈕呈現叉叉，讓你可以進行刪除的動作
    btnHTML = `<button type="button" class="btn btn-danger btn-size btn-remove-favorite fa fa-heart" data-id="${id}"></button>`
  }
  return btnHTML
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
        <p> <i class="fa fa-user fa-lg mr-2" style="color: #6c757d" aria-hidden="true"></i>
          <span id="friend-modal-gender"> ${data.gender} </span>｜
          <span id="friend-modal-age"> ${data.age} </span>
        </p>
        <p> <i class="fa fa-globe mr-1" style="color: #6c757d" aria-hidden="true"></i>
          <span id="friend-modal-region"> ${data.region} </span>
        </p>
        <p id="friend-modal-birthday"> <i class="fa fa-birthday-cake mr-1" style="color: #6c757d" aria-hidden="true"></i>
          ${data.birthday}
        </p>
        <p id="friend-modal-email"><a href="mailto:someone@example.com" style="text-decoration: none; color: inherit"><i class="fa fa-envelope mr-1" style="color: #6c757d" aria-hidden="true"></i> ${data.email} </a></p>
        </div>
    `
  }).catch((error) => console.log(error))
}

// 此處設計收藏電影清單
function addToFavorite(id) {
  // 去取目前在 local storage 的資料，放進收藏清單，因為取出的資料是字串，需用 JSON.parse() 轉成物件做運算，如果裡面沒資料就回傳空陣列
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []

  // 傳入電影的 id，請 find 去電影總表中查看，找出 id 相同的電影物件回傳，暫存在 movie
  const friend = friends.find((friend) => friend.id === id)

  // 假設點擊的電影已經存在 list 裡的話，就跳出提醒文字
  if (list.some((friend) => friend.id === id)) {
    return alert('此電影已經在收藏清單中！')
  } else {
    // 如果沒有這部電影，就推進 list
    list.push(friend)
  }

  // 最後將 list 資料用 JSON.stringify() 轉成字串，把更新後的資料同步到 local storage
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}

// 新增此處設計可以直接從主頁就取消蒐藏，不用跳到我的最愛再來刪除
function cancelFromHome(id) {
  let list = JSON.parse(localStorage.getItem('favoriteFriends'))
  const listIndex = list.findIndex(item => item.id === id)
  list.splice(listIndex, 1)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}

// 此處設計放在每一分頁的電影清單是哪幾部
function getFriendByPage(page) {
  // 如果搜尋結果有東西，條件判斷為 true，會回傳 filteredMovies，反之，則回傳 movies，然後用 data 保存回傳值
  const data = filteredFriends.length ? filteredFriends : friends
  // page 1 → movies 0 ~ 11
  // page 2 → movies 12 ~ 23
  // page 3 → movies 24 ~ 35
  // ...
  const startIndex = (page - 1) * FRIEND_PER_PAGE
  // 從選出來的電影總清單中，切出我們設定好的範圍，得出一個新的陣列，之後再用 renderMovieList(data) 渲染電影畫面
  return data.slice(startIndex, startIndex + FRIEND_PER_PAGE)
}

// 按照電影的總數量計算出會有多少分頁數
function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / FRIEND_PER_PAGE)
  // 製作 template
  let paginatorHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    // 判斷只有在當下頁面才加上 active
    const pageActive = currentPage === page ? 'active' : ''
    paginatorHTML += `
      <li class="page-item ${pageActive}"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = paginatorHTML
}