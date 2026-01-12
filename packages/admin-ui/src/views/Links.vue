<template>
  <div class="links">
    <h1>Ссылки</h1>
    <p>Документация API и ссылки</p>
    <div class="links-content">
      <a 
        :href="swaggerUrl" 
        target="_blank"
        class="link-card"
      >
        <h3>File API - Swagger UI</h3>
        <p>Интерактивная документация API</p>
        <p class="link-url">{{ swaggerUrl }}</p>
      </a>
      <a 
        :href="fileApiUrl" 
        target="_blank"
        class="link-card"
      >
        <h3>File API - OpenAPI Spec</h3>
        <p>Спецификация OpenAPI (JSON)</p>
        <p class="link-url">{{ fileApiUrl }}</p>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getConfig } from '../services/config';

const fileApiBaseUrl = ref('');
const swaggerUrl = computed(() => fileApiBaseUrl.value ? `${fileApiBaseUrl.value}/api-docs` : '');
const fileApiUrl = computed(() => fileApiBaseUrl.value ? `${fileApiBaseUrl.value}/api` : '');

onMounted(async () => {
  const config = await getConfig();
  fileApiBaseUrl.value = config.fileApiUrl;
});
</script>

<style scoped>
.links {
  padding: 2rem 0;
}

.links-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.link-card {
  display: block;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.3s;
}

.link-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.link-card h3 {
  margin: 0 0 0.5rem 0;
  color: #007bff;
}

.link-card p {
  margin: 0.5rem 0 0 0;
  color: #666;
}

.link-url {
  font-size: 0.85rem;
  color: #999;
  font-family: monospace;
  word-break: break-all;
}
</style>
