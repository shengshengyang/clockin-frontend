import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import { useQuasar } from 'quasar'
import 'leaflet/dist/leaflet.css'
import { clockInRequest, fetchAttendanceRecords } from 'src/adaptors/clockInAdaptor'

// 新增型別
interface AttendanceRecord {
  id: number
  username: string
  clockInTime: string
  status: string
}

export default function usePageMap() {
  const $q = useQuasar()

  const userLocation = ref({ lat: 0, lng: 0 })
  let map: L.Map | null = null // 將地圖設為全局可用
  let userMarker: L.Marker | null = null // 使用者位置標記
  // 設定公司位置
  const companyLocation = {
    lat: 24.16195, // 替換成實際公司緯度
    lng: 120.651625, // 替換成實際公司經度
  }

  // 設定打卡範圍半徑（公尺）
  const CHECKIN_RADIUS = 100

  // 自訂圖標
  const userIcon = L.icon({
    iconUrl: '/icons/user-marker.png', // 放在 public/icons 下
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const companyIcon = L.icon({
    iconUrl: '/icons/company-marker.png', // 放在 public/icons 下
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const startDate = ref('')
  const endDate = ref('')

  const columns = [
    { name: 'username', label: '使用者', field: 'username', align: 'center' as const },
    {
      name: 'clockInDate',
      label: '日期',
      field: 'clockInTime',
      sortable: true,
      align: 'center' as const,
      format: (val: string) => {
        const date = new Date(val)
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
      },
    },
    {
      name: 'clockInTime',
      label: '打卡時間',
      field: 'clockInTime',
      sortable: true,
      align: 'center' as const,
      format: (val: string) => {
        const date = new Date(val)
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        return `${date.getHours()}:${minutes}:${seconds}`
      },
    },
    { name: 'status', label: '狀態', field: 'status', align: 'center' as const },
  ]

  // 將 any 改為我們剛才定義的介面
  const attendanceRecords = ref<AttendanceRecord[]>([])

  onMounted(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        userLocation.value.lat = pos.coords.latitude
        userLocation.value.lng = pos.coords.longitude

        // 初始化地圖並將其存入全域變數 map
        map = L.map('map').setView([companyLocation.lat, companyLocation.lng], 15)

        // 加入地圖圖層
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

        // 使用者位置標記
        userMarker = L.marker([userLocation.value.lat, userLocation.value.lng], {
          icon: userIcon,
        })
          .bindPopup('您的位置')
          .addTo(map)

        // 公司位置標記
        L.marker([companyLocation.lat, companyLocation.lng], {
          icon: companyIcon,
        })
          .bindPopup('公司位置')
          .addTo(map)

        // 畫出打卡範圍圓圈
        L.circle([companyLocation.lat, companyLocation.lng], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.2,
          radius: CHECKIN_RADIUS,
        })
          .bindPopup('打卡有效範圍')
          .addTo(map)
      })
    } else {
      console.error('Geolocation is not supported by this browser.')
      $q.notify({ type: 'negative', message: '您的瀏覽器不支援定位功能', position: 'top' })
    }

    await fetchRecordsWithFilter()
  })

  // 日期驗證
  watch(startDate, (newStartDate) => {
    if (newStartDate > endDate.value) {
      $q.notify({
        type: 'negative',
        message: '開始日期不可大於結束日期',
        position: 'top',
      })
      startDate.value = endDate.value
    }
  })

  watch(endDate, (newEndDate) => {
    if (newEndDate < startDate.value) {
      $q.notify({
        type: 'negative',
        message: '結束日期不可小於開始日期',
        position: 'top',
      })
      endDate.value = startDate.value
    }
  })

  async function fetchRecordsWithFilter() {
    try {
      // 後端回傳的整個物件 { page, total, records, data }
      const start = startDate.value || '1970-01-01'
      const end = endDate.value || '2100-12-31'

      const responseData = await fetchAttendanceRecords(start, end)

      // 只取出 data 陣列，給 q-table 使用
      attendanceRecords.value = responseData.data || []
      console.log('attendanceRecords:', attendanceRecords.value)
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: '取得打卡紀錄失敗', position: 'top' })
    }
  }

  async function clockIn() {
    try {
      const resMessage = await clockInRequest(userLocation.value)
      $q.notify({ type: 'positive', message: '打卡成功：' + resMessage, position: 'top' })
      // 打卡後重新撈取
      await fetchRecordsWithFilter()
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: '打卡失敗：' + (error as Error).message,
        position: 'top',
      })
    }
  }

  async function relocate() {
    if (!map) {
      $q.notify({
        type: 'negative',
        message: '地圖尚未初始化，請稍後再試',
        position: 'top',
      })
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLocation.value.lat = pos.coords.latitude
          userLocation.value.lng = pos.coords.longitude

          // 更新使用者位置的標記
          if (userMarker) {
            userMarker.setLatLng([userLocation.value.lat, userLocation.value.lng])
          } else {
            userMarker = L.marker([userLocation.value.lat, userLocation.value.lng], {
              icon: userIcon,
            })
              .bindPopup('您的位置')
              .addTo(map!)
          }

          // 更新地圖的視角
          map!.setView([userLocation.value.lat, userLocation.value.lng], 15)

          $q.notify({ type: 'positive', message: '位置已更新', position: 'top' })
        },
        (err) => {
          console.error('Geolocation error:', err)
          $q.notify({ type: 'negative', message: '無法取得定位', position: 'top' })
        },
      )
    } else {
      $q.notify({ type: 'negative', message: '您的瀏覽器不支援定位功能', position: 'top' })
    }
  }

  return {
    attendanceRecords,
    columns,
    clockIn,
    startDate,
    endDate,
    fetchRecordsWithFilter,
    relocate,
  }
}
