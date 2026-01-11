<template>
  <div class="upload-by-url">
    <h2>Upload by URL</h2>
    
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
        <label for="url-input">File URL:</label>
        <input 
          id="url-input"
          type="url" 
          v-model="fileUrl"
          placeholder="https://example.com/file.pdf"
          class="form-control"
          :disabled="uploading"
        />
      </div>

      <button 
        @click="uploadByUrl" 
        :disabled="!fileUrl || uploading"
        class="btn btn-primary"
      >
        <span v-if="uploading">Downloading and uploading...</span>
        <span v-else>Upload by URL</span>
      </button>
    </div>

    <div v-if="result" class="result-section">
      <h3>Result:</h3>
      <div :class="['result', result.success ? 'success' : 'error']">
        <div v-if="result.success">
          <p><strong>Status:</strong> Success</p>
          <p><strong>File ID:</strong> {{ result.data?.fileId || 'N/A' }}</p>
          <p><strong>URL:</strong> {{ result.data?.url || 'N/A' }}</p>
          <p><strong>Status:</strong> {{ result.data?.status || 'N/A' }}</p>
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
const fileUrl = ref('');
const uploading = ref(false);
const result = ref(null);

const uploadByUrl = async () => {
  if (!fileUrl.value.trim()) return;

  uploading.value = true;
  result.value = null;

  try {
    const client = new FilebumpClient({
      url: apiUrl.value,
      key: apiKey.value,
    });

    const uploadFileId = fileId.value.trim() || null;
    const response = await client.uploadByUrl(fileUrl.value, uploadFileId);

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
.upload-by-url {
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
