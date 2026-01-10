<template>
  <div class="links">
    <h1>Ссылки</h1>
    <p>Документация API и ссылки</p>
    <div class="links-content">
      <a 
        href="https://petstore.swagger.io/?url=https://filebump.services.mobilon.ru/api" 
        target="_blank"
        class="link-card"
      >
        <h3>API Documentation</h3>
        <p>Swagger документация Client API</p>
      </a>
    </div>
  </div>
</template>

<script setup>
// Vue 3 Composition API
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
  margin: 0;
  color: #666;
}
</style>
