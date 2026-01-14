/**
 * Управление авторизацией согласно AUTH_CONCEPT.md
 */

const TOKEN_KEY = 'auth_token';
const AUTH_CONFIG_KEY = 'auth_config';
const AUTH_CONFIG_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Управление токенами
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const hasToken = () => {
  return !!getToken();
};

/**
 * Конфигурация авторизации
 */
let authConfigCache = null;
let authConfigCacheTime = null;
let redirecting = false; // Флаг для предотвращения множественных редиректов

/**
 * Загрузка конфигурации авторизации с бэкенда
 */
export const loadAuthConfig = async () => {
  // Проверка кэша в sessionStorage
  const cached = sessionStorage.getItem(AUTH_CONFIG_KEY);
  if (cached) {
    try {
      const { config, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < AUTH_CONFIG_TTL) {
        return config;
      }
    } catch (e) {
      // Игнорируем ошибки парсинга
    }
  }

  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    
    // Сохраняем только если есть auth конфигурация
    if (data.providerUrl && data.clientId) {
      const config = {
        providerUrl: data.providerUrl,
        clientId: data.clientId,
      };
      
      // Кэшируем в sessionStorage
      sessionStorage.setItem(AUTH_CONFIG_KEY, JSON.stringify({
        config,
        timestamp: Date.now(),
      }));
      
      return config;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load auth config:', error);
    return null;
  }
};

/**
 * Очистка кэша конфигурации
 */
export const clearAuthConfigCache = () => {
  sessionStorage.removeItem(AUTH_CONFIG_KEY);
  authConfigCache = null;
  authConfigCacheTime = null;
};

/**
 * Редирект на авторизацию
 */
export const redirectToAuth = async () => {
  // Предотвращаем множественные редиректы
  if (redirecting) {
    return;
  }
  redirecting = true;

  try {
    const config = await loadAuthConfig();
    
    if (!config) {
      console.warn('Auth config not available, cannot redirect to auth');
      redirecting = false;
      return;
    }

    // Согласно AUTH_CONCEPT.md: GET http://localhost:3000/client/auth?client_id=filebump-admin
    const authUrl = `${config.providerUrl}/client/auth?client_id=${config.clientId}`;
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to redirect to auth:', error);
    redirecting = false;
  }
};

// Глобальный флаг для предотвращения редиректа сразу после получения токена
let justReceivedToken = false;

export const setJustReceivedToken = (value) => {
  justReceivedToken = value;
};

export const getJustReceivedToken = () => {
  return justReceivedToken;
};

/**
 * Обработка токена из query параметров
 */
export const handleTokenFromQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Сохраняем токен
    setToken(token);
    
    // Устанавливаем флаг что токен только что получен
    setJustReceivedToken(true);
    // Сбрасываем флаг через 3 секунды (достаточно для обработки)
    setTimeout(() => {
      setJustReceivedToken(false);
    }, 3000);
    
    // Очищаем URL от токена
    const newUrl = window.location.pathname + 
      (window.location.search.replace(/[?&]token=[^&]*/g, '').replace(/^\?/, '') || '');
    window.history.replaceState({}, '', newUrl || '/');
    
    return true;
  }
  
  return false;
};

/**
 * Проверка авторизации через API
 */
export const checkAuth = async () => {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      return true;
    }
    
    if (response.status === 401) {
      removeToken();
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};
