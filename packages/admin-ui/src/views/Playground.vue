<template>
  <div class="playground">
    <h1>Playground</h1>
    
    <div class="config-header">
      <h3>API Configuration</h3>
      <div class="config-fields">
        <div class="form-group">
          <label for="api-url">API URL:</label>
          <input 
            id="api-url"
            type="text" 
            v-model="apiUrl" 
            placeholder="http://localhost:3007"
            class="form-control"
            @input="saveConfig"
          />
        </div>
        
        <div class="form-group">
          <label for="api-key">API Key:</label>
          <input 
            id="api-key"
            type="text" 
            v-model="apiKey" 
            placeholder="testKey1"
            class="form-control"
            @input="saveConfig"
          />
        </div>
      </div>
    </div>
    
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
import { ref, provide, onMounted } from 'vue';
import UploadFile from '../components/Playground/UploadFile.vue';
import UploadByUrl from '../components/Playground/UploadByUrl.vue';
import Download from '../components/Playground/Download.vue';

const STORAGE_KEY_API_URL = 'filebump-playground-api-url';
const STORAGE_KEY_API_KEY = 'filebump-playground-api-key';

const activeTab = ref('upload-file');
const apiUrl = ref('http://localhost:3007');
const apiKey = ref('testKey1');

// Загрузка из localStorage при монтировании
onMounted(() => {
  const savedApiUrl = localStorage.getItem(STORAGE_KEY_API_URL);
  const savedApiKey = localStorage.getItem(STORAGE_KEY_API_KEY);
  
  if (savedApiUrl) {
    apiUrl.value = savedApiUrl;
  } else {
    // Пробуем взять из env переменных
    const envUrl = import.meta.env.VITE_FILE_API_URL;
    if (envUrl) {
      apiUrl.value = envUrl;
    }
  }
  
  if (savedApiKey) {
    apiKey.value = savedApiKey;
  } else {
    // Пробуем взять из env переменных
    const envKey = import.meta.env.VITE_FILE_API_KEY;
    if (envKey) {
      apiKey.value = envKey;
    }
  }
});

// Сохранение в localStorage
const saveConfig = () => {
  localStorage.setItem(STORAGE_KEY_API_URL, apiUrl.value);
  localStorage.setItem(STORAGE_KEY_API_KEY, apiKey.value);
};

// Предоставляем значения дочерним компонентам
provide('apiUrl', apiUrl);
provide('apiKey', apiKey);
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

.config-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.config-header h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.config-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.config-fields .form-group {
  margin-bottom: 0;
}

.config-fields label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.config-fields .form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .config-fields {
    grid-template-columns: 1fr;
  }
}
</style>
