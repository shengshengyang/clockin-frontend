<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-lg absolute-center" style="max-width: 800px; width: 100%">
      <q-card-section>
        <div id="map" style="height: 500px"></div>
        <q-btn class="q-mt-md" label="打卡" @click="clockIn" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
// ...existing code removed for brevity...
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 使用 Leaflet 或其他開源地圖
// npm install leaflet
// 在 quasar.conf.js > framework > css 中引入 leaflet.css

const userLocation = ref({ lat: 0, lng: 0 })
const companyLocation = { lat: 25.0478, lng: 121.5319 } // 公司的座標

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function clockIn() {
  const dist = getDistance(
    userLocation.value.lat,
    userLocation.value.lng,
    companyLocation.lat,
    companyLocation.lng,
  )
  if (dist < 100) {
    console.log('打卡成功！')
  } else {
    console.log('您不在公司範圍內')
  }
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      userLocation.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }
      // 初始化 Leaflet
      const map = L.map('map').setView([userLocation.value.lat, userLocation.value.lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      L.marker([userLocation.value.lat, userLocation.value.lng]).addTo(map)
    })
  }
})
</script>
