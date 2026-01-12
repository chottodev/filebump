<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      @click="goToPage(currentPage - 1)" 
      :disabled="currentPage === 1"
      class="pagination-btn"
    >
      Previous
    </button>
    
    <span class="pagination-info">
      Page {{ currentPage }} of {{ totalPages }} ({{ totalRecords }} total)
    </span>
    
    <button 
      @click="goToPage(currentPage + 1)" 
      :disabled="currentPage === totalPages"
      class="pagination-btn"
    >
      Next
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  totalRecords: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['page-change']);

const totalPages = computed(() => {
  return Math.ceil(props.totalRecords / props.pageSize);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
