<template>
  <div class="upload-file">
    <h2>Upload File</h2>
    
    <div class="config-section">
      <div class="form-group">
        <label for="file-id">File ID (optional):</label>
        <input 
          id="file-id"
          type="text" 
          v-model="fileId" 
          placeholder="Leave empty to generate new ID"
          class="form-control"
        />
      </div>
    </div>

    <div class="upload-section">
      <div class="form-group">
        <label for="file-input">Select File:</label>
        <input 
          id="file-input"
          type="file" 
          @change="handleFileSelect"
          class="form-control"
          :disabled="uploading"
        />
        <div v-if="selectedFile" class="file-info">
          <p><strong>Selected:</strong> {{ selectedFile.name }}</p>
          <p><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
          <p><strong>Type:</strong> {{ selectedFile.type || 'unknown' }}</p>
        </div>
      </div>

      <button 
        @click="uploadFile" 
        :disabled="!selectedFile || uploading"
        class="btn btn-primary"
      >
        <span v-if="uploading">Uploading...</span>
        <span v-else>Upload File</span>
      </button>
    </div>

    <div v-if="result" class="result-section">
      <h3>Result:</h3>
      <div :class="['result', result.success ? 'success' : 'error']">
        <div v-if="result.success">
          <p><strong>Status:</strong> Success</p>
          <p><strong>File ID:</strong> {{ result.data?.fileId || 'N/A' }}</p>
          <p><strong>URL:</strong> {{ result.data?.url || 'N/A' }}</p>
          <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
        </div>
        <div v-else>
          <p><strong>Status:</strong> Error</p>
          <p><strong>Message:</strong> {{ result.error }}</p>
          <pre v-if="result.details">{{ JSON.stringify(result.details, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import FilebumpClient from '../../services/filebumpClient.js';

// Получаем значения из родительского компонента
const apiUrl = inject('apiUrl');
const apiKey = inject('apiKey');

const fileId = ref('');
const selectedFile = ref(null);
const uploading = ref(false);
const result = ref(null);

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    result.value = null;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  result.value = null;

  try {
    const client = new FilebumpClient({
      url: apiUrl.value,
      key: apiKey.value,
    });

    const uploadFileId = fileId.value.trim() || null;
    const response = await client.upload(selectedFile.value, uploadFileId);

    result.value = {
      success: true,
      data: response.data,
    };
  } catch (error) {
    result.value = {
      success: false,
      error: error.message,
      details: error.response?.data || error.response || null,
    };
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.upload-file {
  max-width: 800px;
}

.config-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.file-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.file-info p {
  margin: 0.5rem 0;
}

.upload-section {
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.result-section {
  margin-top: 2rem;
}

.result {
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.result.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.result.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.result pre {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
}
</style>
