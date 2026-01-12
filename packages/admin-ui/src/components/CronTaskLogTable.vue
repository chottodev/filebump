<template>
  <div class="cron-task-log-table">
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th>Result</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log._id">
          <td>{{ log.task || '-' }}</td>
          <td :class="log.result === 'OK' ? 'status-ok' : 'status-fail'">
            {{ log.result }}
          </td>
          <td>{{ log.date }}</td>
        </tr>
      </tbody>
    </table>

    <Pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total-records="totalRecords"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Pagination from './Pagination.vue';

const logs = ref([]);

// Пагинация
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

const loadLogs = async () => {
  try {
    const start = (currentPage.value - 1) * pageSize.value;
    const response = await api.get('/journals/cron-task-log', {
      params: {
        draw: currentPage.value,
        start: start,
        length: pageSize.value,
        columns: [],
      },
    });
    logs.value = response.data.data || [];
    totalRecords.value = response.data.recordsTotal || 0;
  } catch (error) {
    console.error('Error loading cron task logs:', error);
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadLogs();
};

onMounted(() => {
  loadLogs();
});
</script>

<style scoped>
.cron-task-log-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.status-ok {
  color: #28a745;
  font-weight: bold;
}

.status-fail {
  color: #dc3545;
  font-weight: bold;
}
</style>
