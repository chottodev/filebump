<template>
  <div class="meta-table">
    <table>
      <thead>
        <tr>
          <th>
            <div class="filter-header">
              <div>File ID</div>
              <input 
                type="text" 
                v-model="filters.fileId" 
                @input="onFilterChange"
                placeholder="Filter by File ID..."
                class="filter-input"
              />
            </div>
          </th>
          <th>
            <div class="filter-header">
              <div>Key</div>
              <input 
                type="text" 
                v-model="filters.key" 
                @input="onFilterChange"
                placeholder="Filter by Key..."
                class="filter-input"
              />
            </div>
          </th>
          <th>
            <div class="filter-header">
              <div>Value</div>
              <input 
                type="text" 
                v-model="filters.value" 
                @input="onFilterChange"
                placeholder="Filter by Value..."
                class="filter-input"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="3" class="loading-cell">Loading...</td>
        </tr>
        <tr v-else-if="metaRecords.length === 0">
          <td colspan="3" class="empty-cell">No data available</td>
        </tr>
        <tr v-else v-for="record in metaRecords" :key="record._id">
          <td>{{ record.fileId }}</td>
          <td>{{ record.key }}</td>
          <td>{{ record.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const metaRecords = ref([]);
const loading = ref(false);
const filters = ref({
  fileId: '',
  key: '',
  value: '',
});

let filterTimeout = null;

const loadMeta = async () => {
  loading.value = true;
  try {
    const params = {
      draw: 1,
      start: 0,
      length: 100,
    };
    
    // Добавляем фильтры только если они не пустые
    if (filters.value.fileId) {
      params.fileId = filters.value.fileId;
    }
    if (filters.value.key) {
      params.key = filters.value.key;
    }
    if (filters.value.value) {
      params.value = filters.value.value;
    }
    
    const response = await api.get('/journals/meta', { params });
    metaRecords.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading meta:', error);
    metaRecords.value = [];
  } finally {
    loading.value = false;
  }
};

const onFilterChange = () => {
  // Дебаунс для предотвращения слишком частых запросов
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }
  filterTimeout = setTimeout(() => {
    loadMeta();
  }, 300);
};

onMounted(() => {
  loadMeta();
});
</script>

<style scoped>
.meta-table {
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
  vertical-align: top;
}

.filter-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-header > div:first-child {
  font-weight: bold;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
}

.filter-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.loading-cell, .empty-cell {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

td {
  word-break: break-word;
  max-width: 400px;
}
</style>
