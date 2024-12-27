<!-- filepath: /c:/Users/a24027/Documents/GitHub/clockin-frontend/quasar-project/src/pages/PageMap.vue -->
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
          :rows="attendanceRecords?.data || []"
          :columns="columns"
          row-key="clockInTime"
          class="q-mt-md"
          :rows-per-page-options="[5, 10, 20]"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
// ...existing code...
import usePageMap from './PageMap'
// 呼叫組合式函式
const { attendanceRecords, columns, clockIn } = usePageMap()
</script>
