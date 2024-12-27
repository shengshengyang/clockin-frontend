import { authenticatedFetch } from 'src/composables/useAuth'

export async function clockInRequest(locationPayload: { lat: number; lng: number }) {
  try {
    const response = await authenticatedFetch('http://localhost:8081/api/clock-in', {
      method: 'POST',
      data: {
        latitude: locationPayload.lat,
        longitude: locationPayload.lng,
      },
    })
    return response.data || []
  } catch (err) {
    console.error('Fetch Error:', err)
    throw new Error('打卡失敗，請確認 Token 或伺服器狀態')
  }
}

export async function fetchAttendanceRecords() {
  try {
    const response = await authenticatedFetch('http://localhost:8081/api/records', {
      method: 'GET',
    })
    return response.data || []
  } catch (err) {
    console.error('Fetch Error:', err)
    return []
  }
}
