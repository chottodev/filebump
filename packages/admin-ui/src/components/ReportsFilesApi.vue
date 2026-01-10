<template>
  <div class="reports-files-api">
    <h2>Отчет по API запросам</h2>
    <div class="date-filter">
      <input 
        type="date" 
        v-model="selectedDate" 
        @change="loadReport"
      />
    </div>
    <table v-if="endpoints.length > 0">
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Всего</th>
          <th>OK</th>
          <th>FAIL</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="endpoint in endpoints" :key="endpoint.endpoint">
          <td>{{ endpoint.endpoint }}</td>
          <td>{{ endpoint.all }}</td>
          <td class="status-ok">{{ endpoint.ok }}</td>
          <td class="status-fail">{{ endpoint.fail }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет данных за выбранную дату</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const endpoints = ref([]);

const loadReport = async () => {
  try {
    const response = await api.get('/reports/files-api', {
      params: {
        date: selectedDate.value,
      },
    });
    endpoints.value = response.data.endpoints || [];
  } catch (error) {
    console.error('Error loading report:', error);
    endpoints.value = [];
  }
};

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
.reports-files-api {
  padding: 1rem 0;
}

.date-filter {
  margin-bottom: 2rem;
}

.date-filter input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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
