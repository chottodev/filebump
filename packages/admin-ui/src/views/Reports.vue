<template>
  <div class="reports">
    <h1>Отчеты</h1>
    <ReportsFilesApi />
  </div>
</template>

<script setup>
import ReportsFilesApi from '../components/ReportsFilesApi.vue';
</script>

<style scoped>
.reports {
  padding: 2rem 0;
}
</style>
