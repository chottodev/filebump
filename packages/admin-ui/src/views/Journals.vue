<template>
  <div class="journals">
    <h1>Журналы</h1>
    <div class="tabs">
      <button 
        @click="activeTab = 'files'" 
        :class="{ active: activeTab === 'files' }"
      >
        Файлы
      </button>
      <button 
        @click="activeTab = 'api'" 
        :class="{ active: activeTab === 'api' }"
      >
        API Логи
      </button>
    </div>
    
    <div v-if="activeTab === 'files'" class="tab-content">
      <FilesTable />
    </div>
    
    <div v-if="activeTab === 'api'" class="tab-content">
      <ApiLogsTable />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FilesTable from '../components/FilesTable.vue';
import ApiLogsTable from '../components/ApiLogsTable.vue';

const activeTab = ref('files');
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
}

.tabs button.active {
  border-bottom-color: #007bff;
  color: #007bff;
}

.tab-content {
  margin-top: 1rem;
}
</style>
