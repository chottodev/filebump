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
      
      <div class="form-group">
        <label for="bucket-id">Bucket ID (optional):</label>
        <input 
          id="bucket-id"
          type="text" 
          v-model="bucketId" 
          placeholder="Leave empty to use 'default'"
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <div class="metadata-header">
          <label>Metadata (optional):</label>
          <button 
            @click="addMetadataField" 
            type="button"
            class="btn btn-sm btn-secondary"
          >
            + Add Field
          </button>
        </div>
        
        <div v-if="metadataFields.length === 0" class="metadata-empty">
          No metadata fields. Click "+ Add Field" to add custom metadata.
        </div>
        
        <div 
          v-for="(field, index) in metadataFields" 
          :key="index" 
          class="metadata-field"
        >
          <input 
            type="text" 
            v-model="field.key" 
            placeholder="Key (e.g., tenantId)"
            class="form-control metadata-key"
          />
          <input 
            type="text" 
            v-model="field.value" 
            placeholder="Value (e.g., test1)"
            class="form-control metadata-value"
          />
          <button 
            @click="removeMetadataField(index)" 
            type="button"
            class="btn btn-sm btn-danger"
          >
            Remove
          </button>
        </div>
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
import { FilebumpClient } from '@filebump/filebump-api-client';

// Получаем значения из родительского компонента
const apiUrl = inject('apiUrl');
const apiKey = inject('apiKey');

const fileId = ref('');
const bucketId = ref('');
const selectedFile = ref(null);
const uploading = ref(false);
const result = ref(null);
const metadataFields = ref([]);

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

const addMetadataField = () => {
  metadataFields.value.push({ key: '', value: '' });
};

const removeMetadataField = (index) => {
  metadataFields.value.splice(index, 1);
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
    
    // Формируем объект метаданных из полей формы
    const metadata = {};
    metadataFields.value.forEach(field => {
      const key = field.key?.trim();
      const value = field.value?.trim();
      if (key && value !== '') {
        metadata[key] = value;
      }
    });
    
    // Добавляем bucketId в метаданные, если указан
    const uploadBucketId = bucketId.value.trim();
    if (uploadBucketId) {
      metadata.bucketId = uploadBucketId;
    }
    
    const response = await client.upload(selectedFile.value, uploadFileId, metadata);

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

.metadata-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.metadata-header label {
  margin-bottom: 0;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.metadata-empty {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  font-size: 0.9rem;
  text-align: center;
}

.metadata-field {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.metadata-key {
  flex: 1;
  min-width: 0;
}

.metadata-value {
  flex: 1;
  min-width: 0;
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
