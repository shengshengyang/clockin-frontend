<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div id="map" style="height: 400px"></div>
        <q-btn color="primary" class="q-mt-md" label="打卡" @click="clockIn" />
      </q-card-section>

      <q-card-section>
        <q-table :rows="attendanceRecords" :columns="columns" row-key="id" class="q-mt-md" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const userLocation = ref({ lat: 0, lng: 0 })
const companyLocation = { lat: 25.0478, lng: 121.5319 } // 公司的座標

interface AttendanceRecord {
  id: number
  time: string
  status: string
}

// 打卡紀錄
const attendanceRecords = ref<AttendanceRecord[]>([])

// 定義表格的欄位
const columns = [
  {
    name: 'time',
    label: '打卡時間',
    align: 'left' as 'left' | 'right' | 'center',
    field: 'time',
  },
  {
    name: 'status',
    label: '狀態',
    align: 'left' as 'left' | 'right' | 'center',
    field: 'status',
  },
]

// 設定公司的打卡時間 (例如：9:00 AM)
const companyClockInTime = '09:00:00'

// 計算兩個時間的差異並返回打卡狀態
function getClockInStatus(clockInTime: string): string {
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false })
  const [currentHour = 0, currentMinute = 0, currentSecond = 0] = currentTime.split(':').map(Number)

  const [clockInHour = 0, clockInMinute = 0, clockInSecond = 0] = clockInTime
    .split(':')
    .map((str) => {
      const num = Number(str)
      return isNaN(num) ? 0 : num
    })

  if (currentHour < clockInHour || (currentHour === clockInHour && currentMinute < clockInMinute)) {
    return '準時'
  } else if (
    currentHour === clockInHour &&
    currentMinute === clockInMinute &&
    currentSecond <= clockInSecond
  ) {
    return '準時'
  } else {
    return '遲到'
  }
}

// 計算距離並進行打卡
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
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false })
  const distance = getDistance(
    userLocation.value.lat,
    userLocation.value.lng,
    companyLocation.lat,
    companyLocation.lng,
  )

  if (distance > 100) {
    $q.notify({
      type: 'negative',
      message: '您不在打卡範圍內！',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  const status = getClockInStatus(companyClockInTime)
  const record: AttendanceRecord = {
    id: Date.now(),
    time: currentTime,
    status: status,
  }

  attendanceRecords.value.push(record)
  $q.notify({
    type: 'positive',
    message: '打卡成功！',
    position: 'top',
    timeout: 2000,
  })
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      userLocation.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }

      companyLocation.lat = pos.coords.latitude
      companyLocation.lng = pos.coords.longitude

      const map = L.map('map').setView([userLocation.value.lat, userLocation.value.lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      // Add user marker
      const userMarker = L.marker([userLocation.value.lat, userLocation.value.lng])
        .bindPopup(
          `您的位置<br>緯度: ${userLocation.value.lat.toFixed(4)}<br>經度: ${userLocation.value.lng.toFixed(4)}`,
        )
        .addTo(map)

      // Add range circle
      const distance = getDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        companyLocation.lat,
        companyLocation.lng,
      )
      const isInRange = distance <= 100

      const circle = L.circle([companyLocation.lat, companyLocation.lng], {
        color: isInRange ? 'green' : 'red',
        fillColor: isInRange ? '#0f3' : '#f03',
        fillOpacity: 0.1,
        radius: 100,
      }).addTo(map)

      // Watch location changes
      navigator.geolocation.watchPosition((position) => {
        const newLat = position.coords.latitude
        const newLng = position.coords.longitude

        userLocation.value = { lat: newLat, lng: newLng }
        userMarker.setLatLng([newLat, newLng])

        const newDistance = getDistance(newLat, newLng, companyLocation.lat, companyLocation.lng)
        const newIsInRange = newDistance <= 100

        circle.setStyle({
          color: newIsInRange ? 'green' : 'red',
          fillColor: newIsInRange ? '#0f3' : '#f03',
        })
      })
    })
  }
})
</script>
