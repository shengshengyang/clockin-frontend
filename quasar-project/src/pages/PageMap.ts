import { ref, onMounted } from 'vue'
import L from 'leaflet'
import { useQuasar } from 'quasar'
import 'leaflet/dist/leaflet.css'
import { clockInRequest, fetchAttendanceRecords } from 'src/adaptors/clockInAdaptor'

export default function usePageMap() {
  const $q = useQuasar()

  // 使用者與公司位置
  const userLocation = ref({ lat: 0, lng: 0 })
  const companyLocation = { lat: 0, lng: 0 }

  // 表格欄位
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
        return `${date.getHours()}:${minutes}`
      },
    },
    { name: 'status', label: '狀態', field: 'status', align: 'center' as const },
  ]

  interface AttendanceResponse {
    total: number
    data: AttendanceRecord[]
    records: number
    page: number
  }

  interface AttendanceRecord {
    id: number
    username: string
    clockInTime: string
    status: string
  }

  const attendanceRecords = ref<AttendanceResponse>()

  onMounted(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        userLocation.value.lat = pos.coords.latitude
        userLocation.value.lng = pos.coords.longitude
        companyLocation.lat = pos.coords.latitude
        companyLocation.lng = pos.coords.longitude

        // 初始化地圖
        const map = L.map('map').setView([userLocation.value.lat, userLocation.value.lng], 15)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        L.marker([userLocation.value.lat, userLocation.value.lng]).bindPopup('您的位置').addTo(map)
        L.marker([companyLocation.lat, companyLocation.lng]).bindPopup('公司位置').addTo(map)
      })
    }

    // 取得打卡紀錄
    try {
      attendanceRecords.value = await fetchAttendanceRecords()
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: '取得打卡紀錄失敗', position: 'top' })
    }
  })

  // 打卡
  async function clockIn() {
    try {
      const resMessage = await clockInRequest(userLocation.value)
      $q.notify({ type: 'positive', message: '打卡成功：' + resMessage, position: 'top' })

      // 重新獲取打卡紀錄以刷新表格資料
      attendanceRecords.value = await fetchAttendanceRecords()
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: '打卡失敗：' + (error as Error).message,
        position: 'top',
      })
    }
  }

  return {
    attendanceRecords,
    columns,
    clockIn,
  }
}
