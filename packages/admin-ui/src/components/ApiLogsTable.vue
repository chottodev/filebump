<template>
  <div class="api-logs-table">
    <table>
      <thead>
        <tr>
          <th>File ID</th>
          <th>Endpoint</th>
          <th>Result</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log._id">
          <td>{{ log.fileId || '-' }}</td>
          <td>{{ log.endpoint }}</td>
          <td :class="log.result === 'OK' ? 'status-ok' : 'status-fail'">
            {{ log.result }}
          </td>
          <td>{{ log.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const logs = ref([]);

const loadLogs = async () => {
  try {
    const response = await api.get('/journals/api', {
      params: {
        draw: 1,
        start: 0,
        length: 10,
        columns: [],
      },
    });
    logs.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading logs:', error);
  }
};

onMounted(() => {
  loadLogs();
});
</script>

<style scoped>
.api-logs-table {
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
