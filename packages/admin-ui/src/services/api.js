import axios from 'axios';
import { getToken, removeToken, redirectToAuth, getJustReceivedToken } from './auth';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена в заголовки
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Interceptor для обработки 401 ошибок
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Если только что получили токен, даем время на его обработку
      if (getJustReceivedToken()) {
        // Не редиректим сразу, возможно токен еще обрабатывается
        console.log('Token just received, waiting for validation...');
        return Promise.reject(error);
      }
      
      // Проверяем наличие токена
      const token = getToken();
      if (token) {
        // Токен есть, но невалидный - очищаем и редиректим
        console.log('Token invalid, redirecting to auth...');
        removeToken();
        redirectToAuth().catch(err => {
          console.error('Failed to redirect to auth:', err);
        });
      } else {
        // Токена нет - редиректим
        console.log('No token, redirecting to auth...');
        redirectToAuth().catch(err => {
          console.error('Failed to redirect to auth:', err);
        });
      }
    }
    
    // Для 503 (service unavailable) не редиректим
    if (error.response?.status === 503) {
      console.error('Service temporarily unavailable:', error.response.data);
      // Можно показать сообщение пользователю
    }
    
    return Promise.reject(error);
  }
);

export default api;
