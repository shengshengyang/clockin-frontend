<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-lg" style="max-width: 400px; width: 100%;">
      <q-card-section>
        <div class="text-h6 text-center">編輯會員資訊</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="用戶名" filled dense />
        <q-input v-model="password" type="password" label="新密碼" filled dense class="q-mt-md" />
        <q-input v-model="name" label="姓名" filled dense class="q-mt-md" />
        <q-input v-model="phone" label="電話" filled dense class="q-mt-md" />
        <q-input v-model="email" label="電子郵件" filled dense class="q-mt-md" />
        <q-btn @click="updateInfo" label="更新資訊" color="primary" class="q-mt-md full-width" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mockMembers } from '../composables/useAuth'

const username = ref('')
const password = ref('')
const name = ref('')
const phone = ref('')
const email = ref('')


const fetchUserData = (user: string) => {
  const member = mockMembers.find(member => member.username === user)
  if (member) {
    username.value = member.username
    password.value = member.password
    name.value = member.name
    phone.value = member.phone
    email.value = member.email
  } else {
    alert('用戶不存在')
  }
}

const updateInfo = () => {
  if (username.value && password.value && name.value && phone.value && email.value) {
    alert(`會員資訊已更新：${username.value}`)
    // Here you can add the logic to update the user information in the mockMembers array
  } else {
    alert('請填寫所有欄位')
  }
}

onMounted(() => {
  // Fetch user data when the component is mounted
  fetchUserData('test') // Replace 'test' with the actual username you want to fetch
})
</script>
