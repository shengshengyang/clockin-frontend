// quasar-project/src/composables/useAuth.ts

import { ref } from 'vue'
import type { Router } from 'vue-router'

/**
 * 以 ref 變數記錄當前使用者是否已登入 (用於 UI 呈現)
 * 若你想只依照 localStorage 裡是否有 token 來判斷，也可以在組件內檢查。
 */
const isLoggedIn = ref(false)

/**
 * 使用 fetch (或 axios) 將 username/password 發到後端 /api/login，
 * 若成功，就把後端回傳的 token 存到 localStorage。
 */
const login = async (router: Router, username: string, password: string) => {
  try {
    // 1. 呼叫後端 API
    const response = await fetch('http://localhost:8081/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    // 2. 若狀態碼非 2xx，丟出錯誤
    if (!response.ok) {
      throw new Error('登入失敗')
    }

    // 3. 解析 JSON (假設後端回傳 { token, username, roles, ... })
    const data = await response.json()

    // 4. 將 token 存入 localStorage
    localStorage.setItem('token', data.token)

    // 5. 更新前端 isLoggedIn 狀態
    isLoggedIn.value = true

    // 6. 導向地圖頁 (或任意驗證後的頁面)
    await router.push('/map')
    console.log('Navigation to /map successful')
  } catch (error) {
    console.error(error)
    alert('用戶名或密碼錯誤，或登入失敗')
  }
}

const logout = async (router: Router) => {
  // 1. 移除 token
  localStorage.removeItem('token')

  // 2. 重置登入狀態
  isLoggedIn.value = false

  // 3. 導回登入頁
  await router.push('/')
  console.log('Logged out and navigated to home page')
}

/**
 * 此函式幫忙帶上 JWT Token 的 Header，
 * 供打卡 / 其他需認證的 API 使用。
 */
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('尚未登入或 Token 不存在')
  }

  // 合併自訂 Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // 如果需要攜帶憑證，如 cookies
  }

  return fetch(url, finalOptions)
}

export { isLoggedIn, login, logout, authenticatedFetch }
