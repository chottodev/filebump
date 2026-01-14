import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { handleTokenFromQuery, checkAuth, redirectToAuth, loadAuthConfig, hasToken } from './services/auth';

// Обработка токена из query параметров при загрузке
const tokenFromQuery = handleTokenFromQuery();

// Проверка авторизации при инициализации (неблокирующая)
if (tokenFromQuery) {
  // Если токен был в query, даем время на сохранение и проверяем
  setTimeout(() => {
    if (hasToken()) {
      // Токен сохранен, проверяем его валидность
      checkAuth().catch(err => {
        console.error('Auth check failed after token from query:', err);
      });
    }
  }, 100);
} else {
  // Если токена не было в query, проверяем существующий токен
  if (hasToken()) {
    checkAuth().then((isAuthenticated) => {
      if (!isAuthenticated) {
        // Проверяем есть ли конфигурация авторизации
        loadAuthConfig().then((config) => {
          if (config && config.providerUrl && config.clientId) {
            redirectToAuth();
          }
        });
      }
    });
  } else {
    // Токена нет вообще - проверяем конфигурацию и редиректим
    loadAuthConfig().then((config) => {
      if (config && config.providerUrl && config.clientId) {
        redirectToAuth();
      }
    });
  }
}

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
