<template>
  <div class="charts-files-api">
    <h2>График по API запросам</h2>
    <div v-if="chartData.labels.length > 0" class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <p v-else>Загрузка данных...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';

const chartCanvas = ref(null);
const chartData = ref({
  labels: [],
  ok: [],
  fail: [],
});

let chartInstance = null;

const loadChartData = async () => {
  try {
    const response = await api.get('/charts/files-api');
    chartData.value = response.data.data || { labels: [], ok: [], fail: [] };
    
    if (chartInstance && chartCanvas.value) {
      drawChart();
    }
  } catch (error) {
    console.error('Error loading chart data:', error);
    chartData.value = { labels: [], ok: [], fail: [] };
  }
};

const drawChart = () => {
  if (!chartCanvas.value) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  
  // Simple chart drawing (можно заменить на Chart.js или другую библиотеку)
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Placeholder - в реальности используйте Chart.js или другую библиотеку
  // Для примера просто показываем данные
  console.log('Chart data:', chartData.value);
};

onMounted(async () => {
  await loadChartData();
  if (chartCanvas.value && chartData.value.labels.length > 0) {
    drawChart();
  }
});

watch(chartData, () => {
  if (chartInstance && chartCanvas.value) {
    drawChart();
  }
}, { deep: true });
</script>

<style scoped>
.charts-files-api {
  padding: 1rem 0;
}

.chart-container {
  margin-top: 2rem;
  height: 400px;
  position: relative;
}

canvas {
  max-width: 100%;
  height: 100%;
}
</style>
