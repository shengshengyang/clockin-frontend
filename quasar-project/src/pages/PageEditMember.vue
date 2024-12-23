<!-- quasar-project/src/pages/PageEditMember.vue -->
<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-lg" style="max-width: 400px; width: 100%;">
      <q-card-section>
        <div class="text-h6 text-center">編輯會員資訊</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="用戶名" filled dense />
        <q-input v-model="password" type="password" label="新密碼" filled dense class="q-mt-md" />
        <q-btn @click="updateInfo" label="更新資訊" color="primary" class="q-mt-md full-width" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const username = ref('');
const password = ref('');

const updateInfo = () => {
  if (username.value && password.value) {
    alert(`會員資訊已更新：${username.value}`);
    username.value = '';
    password.value = '';
  } else {
    alert('請輸入用戶名和新密碼');
  }
};
</script>
