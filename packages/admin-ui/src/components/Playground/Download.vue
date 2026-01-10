<template>
  <div class="download">
    <h2>Download File</h2>
    
    <div class="config-section">
      <div class="form-group">
        <label for="api-url">API URL:</label>
        <input 
          id="api-url"
          type="text" 
          v-model="apiUrl" 
          placeholder="http://localhost:3007"
          class="form-control"
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
        />
      </div>
    </div>

    <div class="download-section">
      <div class="form-group">
        <label for="file-id-input">File ID:</label>
        <input 
          id="file-id-input"
          type="text" 
          v-model="fileId"
          placeholder="Enter file ID to download"
          class="form-control"
          :disabled="downloading || gettingInfo"
        />
      </div>

      <div class="button-group">
        <button 
          @click="getFileInfo" 
          :disabled="!fileId || downloading || gettingInfo"
          class="btn btn-secondary"
        >
          <span v-if="gettingInfo">Getting info...</span>
          <span v-else>Get File Info</span>
        </button>

        <button 
          @click="downloadFile" 
          :disabled="!fileId || downloading || gettingInfo"
          class="btn btn-primary"
        >
          <span v-if="downloading">Downloading...</span>
          <span v-else>Download File</span>
        </button>
      </div>
    </div>

    <div v-if="fileInfo" class="file-info-section">
      <h3>File Information:</h3>
      <div class="info-box">
        <p><strong>File ID:</strong> {{ fileInfo.fileId || 'N/A' }}</p>
        <p><strong>File Name:</strong> {{ fileInfo.fileName || 'N/A' }}</p>
        <p><strong>MIME Type:</strong> {{ fileInfo.mimetype || 'N/A' }}</p>
        <p><strong>Size:</strong> {{ fileInfo.size ? formatFileSize(fileInfo.size) : 'N/A' }}</p>
        <p><strong>Date:</strong> {{ fileInfo.date || 'N/A' }}</p>
      </div>
    </div>

    <div v-if="result" class="result-section">
      <h3>Result:</h3>
      <div :class="['result', result.success ? 'success' : 'error']">
        <div v-if="result.success">
          <p><strong>Status:</strong> Success</p>
          <p v-if="result.downloadUrl"><strong>Download URL:</strong> 
            <a :href="result.downloadUrl" target="_blank" rel="noopener noreferrer">
              {{ result.downloadUrl }}
            </a>
          </p>
          <p v-if="result.message">{{ result.message }}</p>
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
import { ref } from 'vue';
import FilebumpClient from '../../services/filebumpClient.js';

const apiUrl = ref('http://localhost:3007');
const apiKey = ref('testKey1');
const fileId = ref('');
const downloading = ref(false);
const gettingInfo = ref(false);
const fileInfo = ref(null);
const result = ref(null);

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileInfo = async () => {
  if (!fileId.value.trim()) return;

  gettingInfo.value = true;
  fileInfo.value = null;
  result.value = null;

  try {
    const client = new FilebumpClient({
      url: apiUrl.value,
      key: apiKey.value,
    });

    // Note: This endpoint might not exist, adjust based on actual API
    const response = await client.getFileInfo(fileId.value);
    fileInfo.value = response.data;
    
    result.value = {
      success: true,
      message: 'File information retrieved successfully',
    };
  } catch (error) {
    result.value = {
      success: false,
      error: error.message,
      details: error.response?.data || error.response || null,
    };
  } finally {
    gettingInfo.value = false;
  }
};

const downloadFile = async () => {
  if (!fileId.value.trim()) return;

  downloading.value = true;
  result.value = null;

  try {
    const client = new FilebumpClient({
      url: apiUrl.value,
      key: apiKey.value,
    });

    const response = await client.download(fileId.value);

    // Create download link
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileId.value;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    result.value = {
      success: true,
      message: 'File downloaded successfully',
      downloadUrl: url,
    };
  } catch (error) {
    result.value = {
      success: false,
      error: error.message,
      details: error.response?.data || error.response || null,
    };
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
.download {
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

.download-section {
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-info-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.info-box {
  padding: 1.5rem;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  margin-top: 1rem;
}

.info-box p {
  margin: 0.5rem 0;
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

.result a {
  color: #007bff;
  text-decoration: underline;
}
</style>
