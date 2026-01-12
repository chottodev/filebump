<template>
  <div id="app">
    <nav class="navbar navbar-inverse">
      <div class="container">
        <a class="navbar-brand" href="/">
          Filebump Admin
          <span class="version">v{{ version }}</span>
        </a>
        <ul class="nav navbar-nav">
          <li>
            <router-link to="/data" class="nav-link">Данные</router-link>
          </li>
          <li>
            <router-link to="/journals" class="nav-link">Журналы</router-link>
          </li>
          <li>
            <router-link to="/reports" class="nav-link">Отчеты</router-link>
          </li>
          <li>
            <router-link to="/links" class="nav-link">Ссылки</router-link>
          </li>
          <li>
            <router-link to="/playground" class="nav-link">Playground</router-link>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
const version = __APP_VERSION__ || 'unknown';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.navbar {
  background-color: #222;
  color: #fff;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.navbar-brand {
  color: #fff;
  font-size: 1.5rem;
  text-decoration: none;
  margin-right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-brand .version {
  font-size: 0.875rem;
  color: #aaa;
  font-weight: normal;
}

.navbar-nav {
  display: flex;
  list-style: none;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: #ccc;
  text-decoration: none;
}

.nav-link.router-link-active {
  color: #fff;
  font-weight: bold;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
