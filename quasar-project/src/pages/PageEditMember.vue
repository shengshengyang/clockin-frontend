<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-lg" style="max-width: 400px; width: 100%;">
      <q-card-section>
        <div class="text-h6 text-center">編輯會員資訊</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="用戶名" filled dense />
        <q-input
          v-model="password"
          type="password"
          label="新密碼"
          filled
          dense
          class="q-mt-md"
        />
        <q-input v-model="name" label="姓名" filled dense class="q-mt-md" />
        <q-input v-model="phone" label="電話" filled dense class="q-mt-md" />
        <q-input v-model="email" label="電子郵件" filled dense class="q-mt-md" />
        <q-btn
          @click="updateInfo"
          label="更新資訊"
          color="primary"
          class="q-mt-md full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// ★ 不再使用 mockMembers
import { authenticatedFetch } from '../composables/useAuth' // 你自己定義的帶 token 請求

const username = ref('')
const password = ref('')
const name = ref('')
const phone = ref('')
const email = ref('')

/**
 * 從後端撈取某個使用者的資料
 * GET /api/user?username={xxx}
 */
async function fetchUserData(user: string) {
  try {
    const response = await authenticatedFetch(
      `http://localhost:8081/api/user?username=${user}`,
      {
        method: 'GET'
      }
    )
    const data = await response.json()

    // 假設後端回傳: { username, name, phone, email }
    username.value = data.username
    name.value = data.name
    phone.value = data.phone
    email.value = data.email
    // password 後端通常不會明碼傳給前端，若需要重設，就在這裡置空或自行處理
    password.value = ''
  } catch (error) {
    console.error(error)
    alert('用戶不存在或取得資料失敗')
  }
}

/**
 * 更新會員資訊
 * PUT /api/user
 * Body: { username, password, name, phone, email }
 */
async function updateInfo() {
  if (username.value && password.value && name.value && phone.value && email.value) {
    try {
      const bodyData = {
        username: username.value,
        password: password.value,
        name: name.value,
        phone: phone.value,
        email: email.value
      }

      await authenticatedFetch('http://localhost:8081/api/user', {
        method: 'PUT',
        body: JSON.stringify(bodyData)
      })

      alert(`會員資訊已更新：${username.value}`)
    } catch (error) {
      console.error(error)
      alert('更新失敗，請檢查伺服器或權限')
    }
  } else {
    alert('請填寫所有欄位')
  }
}

// onMounted 時，假設用固定的 'test' 或從 route 取得當前登入的使用者
onMounted(() => {
  // 例如從 route query 取 username
  // const route = useRoute()
  // const user = route.query.username || 'test'
  fetchUserData('test') // 你可改成動態取得
})
</script>
