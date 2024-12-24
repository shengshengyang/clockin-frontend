<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="isLoggedIn"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          <div class="absolute-center">
            <q-icon name="more_time" />
            打卡系統
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isLoggedIn" class="bg-primary" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label class="text-white" header> 導覽頁 </q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        <q-item clickable class="text-white" @click="logoutHandler">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>登出</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 引入 useRouter
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'
import { isLoggedIn, logout } from '../composables/useAuth'

const router = useRouter() // 獲取 router 實例

const linksList: EssentialLinkProps[] = [
  {
    title: '編輯資料',
    icon: 'edit',
    link: '/edit-member',
  },
  {
    title: '地圖',
    icon: 'map',
    link: '/map',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// 登出事件處理函數，將 router 實例傳遞給 logout
const logoutHandler = () => {
  logout(router) // 將 router 實例傳遞給 logout 函數
}
</script>
