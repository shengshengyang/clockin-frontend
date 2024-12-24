// quasar-project/src/composables/useAuth.ts
import { ref } from 'vue'
import type { Router } from 'vue-router' // 用 `import type` 引入 Router 類型

const isLoggedIn = ref(false)
export const mockMembers = [
  { username: 'test', password: 'test1234', name: 'John Doe', phone: '123-456-7890', email: 'john@example.com' },
  { username: 'jane_smith', password: 'password456', name: 'Jane Smith', phone: '987-654-3210', email: 'jane@example.com' },
  { username: 'alice_jones', password: 'password789', name: 'Alice Jones', phone: '555-555-5555', email: 'alice@example.com' }
]

const login = (router: Router, username: string, password: string) => {
  const user = mockMembers.find(member => member.username === username && member.password === password)
  if (user) {
    isLoggedIn.value = true
    router.push('/map') // 跳轉到 map 頁面
      .then(() => {
        console.log('Navigation to /map successful')
      })
      .catch(err => {
        console.error('Navigation to /map failed', err)
      })
  } else {
    alert('用戶名或密碼錯誤')
  }
}
const logout = (router: Router) => {
  isLoggedIn.value = false
  router.push('/').then(() => {
    console.log('Logged out and navigated to home page')
  })
}

export { isLoggedIn, login, logout }
