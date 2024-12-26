import { authenticatedFetch } from 'src/composables/useAuth'

export async function clockInRequest(locationPayload: { lat: number; lng: number }) {
  const response = await authenticatedFetch('http://localhost:8081/api/clock-in', {
    method: 'POST',
    body: JSON.stringify({
      latitude: locationPayload.lat,
      longitude: locationPayload.lng,
    }),
  })
  if (!response.ok) {
    throw new Error('打卡失敗，請確認 Token 或伺服器狀態')
  }
  return await response.text() // e.g. "打卡成功" / "遲到" 等
}

export async function fetchAttendanceRecords() {
  const response = await authenticatedFetch('http://localhost:8081/api/records', {
    method: 'GET',
  })
  if (!response.ok) {
    throw new Error('無法取得打卡紀錄')
  }
  const data = await response.json()
  return data.data || []
}
