<template>
  <div class="buckets-table">
    <table>
      <thead>
        <tr>
          <th>Bucket ID</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bucket in buckets" :key="bucket._id">
          <td>{{ bucket.bucketId }}</td>
          <td>{{ bucket.createdAt }}</td>
          <td>
            <button 
              @click="viewBucketFiles(bucket)" 
              class="btn btn-primary"
            >
              View Files
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const buckets = ref([]);

const loadBuckets = async () => {
  try {
    const response = await api.get('/journals/buckets', {
      params: {
        draw: 1,
      },
    });
    buckets.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading buckets:', error);
  }
};

const viewBucketFiles = (bucket) => {
  // TODO: Implement navigation to files filtered by bucketId
  console.log('View files for bucket:', bucket.bucketId);
};

onMounted(() => {
  loadBuckets();
});
</script>

<style scoped>
.buckets-table {
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

.btn {
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
