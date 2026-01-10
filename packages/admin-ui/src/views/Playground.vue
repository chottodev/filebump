<template>
  <div class="playground">
    <h1>Playground</h1>
    <div class="tabs">
      <button 
        @click="activeTab = 'upload-file'" 
        :class="{ active: activeTab === 'upload-file' }"
      >
        Upload File
      </button>
      <button 
        @click="activeTab = 'upload-url'" 
        :class="{ active: activeTab === 'upload-url' }"
      >
        Upload by URL
      </button>
      <button 
        @click="activeTab = 'download'" 
        :class="{ active: activeTab === 'download' }"
      >
        Download
      </button>
    </div>
    
    <div v-if="activeTab === 'upload-file'" class="tab-content">
      <UploadFile />
    </div>
    
    <div v-if="activeTab === 'upload-url'" class="tab-content">
      <UploadByUrl />
    </div>
    
    <div v-if="activeTab === 'download'" class="tab-content">
      <Download />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UploadFile from '../components/Playground/UploadFile.vue';
import UploadByUrl from '../components/Playground/UploadByUrl.vue';
import Download from '../components/Playground/Download.vue';

const activeTab = ref('upload-file');
</script>

<style scoped>
.playground {
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
  margin-top: 2rem;
}
</style>
