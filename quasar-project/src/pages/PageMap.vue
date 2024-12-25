<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <!-- 地圖容器 -->
        <div id="map" style="height: 400px"></div>

        <!-- 打卡按鈕 -->
        <q-btn color="primary" class="q-mt-md" label="打卡" @click="clockIn" />
      </q-card-section>

      <q-card-section>
        <!-- 打卡紀錄表格 -->
        <q-table
          :rows="attendanceRecords"
          :columns="columns"
          row-key="id"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuasar } from 'quasar'
// ★ 引入我們在 useAuth.ts 中定義的 authenticatedFetch（帶 Token）
import { authenticatedFetch } from 'src/composables/useAuth'

// Quasar
const $q = useQuasar()

// 使用者與公司位置 (預設 0, 0；onMounted 會更新)
const userLocation = ref({ lat: 0, lng: 0 })
// 公司座標可先預設台北 101 附近；或由後端設定
const companyLocation = { lat: 25.0478, lng: 121.5319 }

// 打卡紀錄表格所需
interface AttendanceRecord {
  id: number
  clockInTime: string
  message: string
}

// 前端用來顯示打卡歷史，假設只記憶當次 session 內的打卡結果
const attendanceRecords = ref<AttendanceRecord[]>([])

// 定義表格的欄位
const columns = [
  { name: 'clockInTime', label: '打卡時間', align: 'left' as const, field: 'clockInTime' },
  { name: 'message', label: '回傳訊息', align: 'left' as const, field: 'message' }
]

// 計算兩個座標距離 (公尺)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

/**
 * 按下「打卡」按鈕 → 前端先做距離檢查 (可選)，通過後 → 呼叫後端 /api/clock-in
 */
async function clockIn() {
  // 前端檢查使用者是否在公司 100m 範圍內
  const distance = getDistance(
    userLocation.value.lat,
    userLocation.value.lng,
    companyLocation.lat,
    companyLocation.lng
  )

  if (distance > 100) {
    $q.notify({
      type: 'negative',
      message: '您不在打卡範圍內！',
      position: 'top',
      timeout: 2000
    })
    return
  }

  // 準備要送給後端的經緯度
  const locationPayload = {
    latitude: userLocation.value.lat,
    longitude: userLocation.value.lng
  }

  try {
    // 用 authenticatedFetch，自動帶 Bearer token
    const response = await authenticatedFetch('http://localhost:8081/api/clock-in', {
      method: 'POST',
      body: JSON.stringify(locationPayload)
    })

    if (!response.ok) {
      throw new Error('打卡失敗，請確認 Token 或伺服器狀態')
    }

    // 取得後端回傳的字串，例如 "打卡成功" / "遲到" / ...
    const resultMessage = await response.text()

    // 通知使用者
    $q.notify({
      type: 'positive',
      message: '打卡成功！後端回覆：' + resultMessage,
      position: 'top',
      timeout: 2000
    })

    // 若想在前端表格顯示這次打卡結果
    attendanceRecords.value.push({
      id: Date.now(),
      clockInTime: new Date().toLocaleString('zh-TW', { hour12: false }),
      message: resultMessage
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: '打卡失敗：' + (error as Error).message,
      position: 'top',
      timeout: 2000
    })
  }
}

/**
 * onMounted：取使用者當前位置、初始化地圖
 */
onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      userLocation.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }

      // ※ 如果你要固定公司的位置，就不要動這裡
      // companyLocation.lat = pos.coords.latitude
      // companyLocation.lng = pos.coords.longitude

      const map = L.map('map').setView(
        [userLocation.value.lat, userLocation.value.lng],
        15
      )
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      // 使用者位置 Marker
      const userMarker = L.marker([
        userLocation.value.lat,
        userLocation.value.lng
      ])
        .bindPopup(
          `您的位置<br>緯度: ${userLocation.value.lat.toFixed(
            4
          )}<br>經度: ${userLocation.value.lng.toFixed(4)}`
        )
        .addTo(map)

      // 加一個 100m range 圓圈 (以公司位置為中心)
      const distance = getDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        companyLocation.lat,
        companyLocation.lng
      )
      const isInRange = distance <= 100

      const circle = L.circle([companyLocation.lat, companyLocation.lng], {
        color: isInRange ? 'green' : 'red',
        fillColor: isInRange ? '#0f3' : '#f03',
        fillOpacity: 0.1,
        radius: 100
      }).addTo(map)

      // 監聽使用者位置變化
      navigator.geolocation.watchPosition(position => {
        const newLat = position.coords.latitude
        const newLng = position.coords.longitude

        userLocation.value = { lat: newLat, lng: newLng }
        userMarker.setLatLng([newLat, newLng])

        const newDistance = getDistance(
          newLat,
          newLng,
          companyLocation.lat,
          companyLocation.lng
        )
        const newIsInRange = newDistance <= 100

        circle.setStyle({
          color: newIsInRange ? 'green' : 'red',
          fillColor: newIsInRange ? '#0f3' : '#f03'
        })
      })
    })
  }
})
</script>
