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

export async function fetchAttendanceRecords(startDate?: string, endDate?: string) {
  try {
    const queryParams = new URLSearchParams()
    if (startDate) {
      queryParams.set('startDate', startDate)
    }
    if (endDate) {
      queryParams.set('endDate', endDate)
    }
    const url = `http://localhost:8081/api/records?${queryParams.toString()}`
    const response = await authenticatedFetch(url, {
      method: 'GET',
    })
    return response.data || []
  } catch (err) {
    console.error('Fetch Error:', err)
    return []
  }
}
