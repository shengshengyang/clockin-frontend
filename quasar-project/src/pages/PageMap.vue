<!-- filepath: /c:/Users/a24027/Documents/GitHub/clockin-frontend/quasar-project/src/pages/PageMap.vue -->
<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div id="map" style="height: 400px"></div>

        <q-btn color="primary" class="q-mt-md" label="打卡" @click="clockIn" />

        <div class="row q-my-md q-col-gutter-md">
          <!-- 開始日期 -->
          <div class="col-12 col-sm-6">
            <q-input v-model="startDate" label="開始日期" type="date" dense filled />
          </div>
          <!-- 結束日期 -->
          <div class="col-12 col-sm-6">
            <q-input v-model="endDate" label="結束日期" type="date" dense filled />
          </div>
        </div>

        <q-btn color="primary" class="q-my-md" label="搜尋" @click="fetchRecordsWithFilter" />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="attendanceRecords"
          :columns="columns"
          row-key="id"
          class="q-mt-md"
          :rows-per-page-options="[5, 10, 20]"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import usePageMap from './PageMap'

const { attendanceRecords, columns, clockIn, startDate, endDate, fetchRecordsWithFilter } =
  usePageMap()
</script>
