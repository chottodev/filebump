<template>
  <div class="journals">
    <h1>Журналы</h1>
    <div class="tabs">
      <button 
        @click="activeTab = 'file-api-log'" 
        :class="{ active: activeTab === 'file-api-log' }"
      >
        FileApiLog
      </button>
      <button 
        @click="activeTab = 'cron-task-log'" 
        :class="{ active: activeTab === 'cron-task-log' }"
      >
        CronTaskLog
      </button>
    </div>
    
    <div v-if="activeTab === 'file-api-log'" class="tab-content">
      <FileApiLogTable />
    </div>
    
    <div v-if="activeTab === 'cron-task-log'" class="tab-content">
      <CronTaskLogTable />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileApiLogTable from '../components/FileApiLogTable.vue';
import CronTaskLogTable from '../components/CronTaskLogTable.vue';

const activeTab = ref('file-api-log');
</script>

<style scoped>
.journals {
  padding: 2rem 0;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #ddd;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 1rem;
}

.tabs button:hover {
  color: #007bff;
}

.tabs button.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: bold;
}

.tab-content {
  margin-top: 1rem;
}
</style>
