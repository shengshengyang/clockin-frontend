<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 400px; width: 100%;">
      <q-card-section>
        <div class="text-h6 text-center">登入</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="用戶名" filled dense />
        <q-input
          v-model="password"
          type="password"
          label="密碼"
          filled
          dense
          class="q-mt-md"
        />
        <q-btn @click="handleLogin" label="登入" color="primary" class="q-mt-md full-width" />
        <q-btn flat @click="forgotPassword" label="忘記密碼" color="secondary" class="q-mt-md full-width" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from 'src/composables/useAuth'

const username = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  if (username.value && password.value) {
    await login(router, username.value, password.value)
  } else {
    alert('請輸入用戶名和密碼')
  }
}

const forgotPassword = () => {
  alert('請聯繫管理員重置密碼')
}
</script>
