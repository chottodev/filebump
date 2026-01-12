import api from './api';

let configCache = null;

/**
 * Загружает конфигурацию с бэкенда
 */
export const loadConfig = async () => {
  if (configCache) {
    return configCache;
  }
  
  try {
    const response = await api.get('/config');
    configCache = response.data;
    return configCache;
  } catch (error) {
    console.error('Failed to load config from backend:', error);
    // Fallback на дефолтные значения
    return {
      fileApiUrl: import.meta.env.VITE_FILE_API_URL || (import.meta.env.DEV ? 'http://localhost:3007' : '/file-api'),
      fileApiKey: import.meta.env.VITE_FILE_API_KEY || 'testKey1',
    };
  }
};

/**
 * Получает кешированную конфигурацию или загружает её
 */
export const getConfig = async () => {
  return await loadConfig();
};

/**
 * Очищает кеш конфигурации (для тестирования)
 */
export const clearConfigCache = () => {
  configCache = null;
};
