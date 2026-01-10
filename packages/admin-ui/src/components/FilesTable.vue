<template>
  <div class="files-table">
    <table>
      <thead>
        <tr>
          <th>File ID</th>
          <th>Mimetype</th>
          <th>Size</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in files" :key="file._id">
          <td>{{ file.fileId }}</td>
          <td>{{ file.mimetype }}</td>
          <td>{{ file.size }}</td>
          <td>{{ file.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const files = ref([]);

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
</style>
