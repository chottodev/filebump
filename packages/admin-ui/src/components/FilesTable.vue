<template>
  <div class="files-table">
    <table>
      <thead>
        <tr>
          <th>File ID</th>
          <th>Mimetype</th>
          <th>Size</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in files" :key="file._id">
          <td>{{ file.fileId }}</td>
          <td>{{ file.mimetype }}</td>
          <td>{{ file.size }}</td>
          <td>{{ file.date }}</td>
          <td>
            <div class="action-buttons">
              <button 
                @click="downloadFile(file)" 
                class="btn btn-download"
                :disabled="downloading === file.fileId"
              >
                <span v-if="downloading === file.fileId">Downloading...</span>
                <span v-else>Download</span>
              </button>
              <button 
                @click="showMetadata(file)" 
                class="btn btn-metadata"
                :disabled="loadingMetadata === file.fileId"
              >
                <span v-if="loadingMetadata === file.fileId">Loading...</span>
                <span v-else>Metadata</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно для метаданных -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>File Metadata</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingMetadata" class="loading">Loading metadata...</div>
          <div v-else-if="metadataError" class="error">{{ metadataError }}</div>
          <div v-else-if="currentMetadata && Object.keys(currentMetadata.metadata || {}).length > 0" class="metadata-list">
            <div class="metadata-item">
              <strong>File ID:</strong>
              <span>{{ currentMetadata.fileId }}</span>
            </div>
            <div v-for="(value, key) in currentMetadata.metadata" :key="key" class="metadata-item">
              <strong>{{ formatKey(key) }}:</strong>
              <span>{{ value }}</span>
            </div>
          </div>
          <div v-else class="no-data">No metadata available for this file</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import axios from 'axios';
import { FilebumpClient } from '@filebump/filebump-api-client';

const files = ref([]);
const downloading = ref(null);
const loadingMetadata = ref(null);
const showModal = ref(false);
const currentMetadata = ref(null);
const metadataError = ref(null);

// URL client-api для скачивания файлов
const clientApiUrl = import.meta.env.VITE_CLIENT_API_URL || 'http://localhost:3007';
const clientApiKey = import.meta.env.VITE_CLIENT_API_KEY || 'testKey1';

// Инициализируем FilebumpClient для работы с метаданными
const filebumpClient = new FilebumpClient({
  url: clientApiUrl,
  key: clientApiKey,
});

const loadFiles = async () => {
  try {
    const response = await api.get('/journals/files', {
      params: {
        draw: 1,
        start: 0,
        length: 10,
        columns: [],
      },
    });
    files.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading files:', error);
  }
};

const downloadFile = async (file) => {
  if (!file || !file.fileId) return;
  
  downloading.value = file.fileId;
  
  try {
    // Скачиваем файл через client-api
    const response = await axios.get(`${clientApiUrl}/file/${file.fileId}`, {
      headers: {
        'X-API-Key': clientApiKey,
      },
      responseType: 'blob', // Важно для скачивания файла
    });
    
    // Создаем blob URL и скачиваем файл
    const blob = new Blob([response.data], { type: file.mimetype || 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Определяем имя файла из mimetype или используем fileId
    const extension = getExtensionFromMimetype(file.mimetype);
    const fileName = file.name || `file_${file.fileId}${extension}`;
    link.download = fileName;
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert(`Ошибка при скачивании файла: ${error.message}`);
  } finally {
    downloading.value = null;
  }
};

// Получаем расширение файла из mimetype
const getExtensionFromMimetype = (mimetype) => {
  if (!mimetype) return '';
  
  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/html': '.html',
    'application/json': '.json',
    'audio/mpeg': '.mp3',
    'video/mp4': '.mp4',
  };
  
  return mimeMap[mimetype] || '';
};

const showMetadata = async (file) => {
  if (!file || !file.fileId) return;
  
  loadingMetadata.value = file.fileId;
  showModal.value = true;
  currentMetadata.value = null;
  metadataError.value = null;
  
  try {
    const response = await filebumpClient.getMetadata(file.fileId);
    currentMetadata.value = response.data;
  } catch (error) {
    console.error('Error loading metadata:', error);
    metadataError.value = error.response?.data?.error || error.message || 'Failed to load metadata';
  } finally {
    loadingMetadata.value = null;
  }
};

const closeModal = () => {
  showModal.value = false;
  currentMetadata.value = null;
  metadataError.value = null;
};

const formatKey = (key) => {
  // Форматируем ключ для отображения
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

onMounted(() => {
  loadFiles();
});
</script>

<style scoped>
.files-table {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-download {
  background-color: #007bff;
}

.btn-download:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-metadata {
  background-color: #6c757d;
}

.btn-metadata:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background-color: #6c757d;
  padding: 0.5rem 1.5rem;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.metadata-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metadata-item {
  display: flex;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.metadata-item strong {
  min-width: 150px;
  margin-right: 1rem;
  color: #333;
}

.metadata-item span {
  flex: 1;
  word-break: break-word;
  color: #666;
}
</style>
