<template>
  <div class="data">
    <h1>Данные</h1>
    <div class="tabs">
      <button 
        @click="activeTab = 'files'" 
        :class="{ active: activeTab === 'files' }"
      >
        Файлы
      </button>
      <button 
        @click="activeTab = 'meta'" 
        :class="{ active: activeTab === 'meta' }"
      >
        Meta
      </button>
    </div>
    
    <div v-if="activeTab === 'files'" class="tab-content">
      <FilesTable />
    </div>
    
    <div v-if="activeTab === 'meta'" class="tab-content">
      <MetaTable />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FilesTable from '../components/FilesTable.vue';
import MetaTable from '../components/MetaTable.vue';

const activeTab = ref('files');
</script>

<style scoped>
.data {
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
