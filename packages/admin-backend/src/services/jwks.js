const jwksClient = require('jwks-rsa');
const config = require('../config');

/**
 * JWKS Client для получения публичных ключей от Auth Service
 * Путь к JWKS можно указать через JWKS_URI или будет использован стандартный /jwks
 */
const JWKS_URI = config.jwksUri || `${config.authProviderUrl}/jwks`;

const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 86400000, // 24 часа
  rateLimit: true,
  jwksRequestsPerMinute: 100, // Увеличено для предотвращения rate limiting
  requestHeaders: {}, // Дополнительные заголовки если нужно
  timeout: 30000, // 30 секунд таймаут
});

/**
 * Получение ключа для валидации JWT
 */
function getKey(header, callback) {
  if (!header || !header.kid) {
    return callback(new Error('JWT header missing or missing kid'));
  }

  const kid = header.kid;
  
  client.getSigningKey(kid, (err, key) => {
    if (err) {
      // Детальное логирование для отладки
      console.error(`JWKS error for kid=${kid}:`, err.message);
      if (err.message === 'Not Found') {
        console.error(`Key with kid=${kid} not found in JWKS. Check if JWKS endpoint is accessible: ${JWKS_URI}`);
      }
      return callback(err);
    }
    
    try {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    } catch (keyErr) {
      console.error('Error getting public key:', keyErr);
      callback(keyErr);
    }
  });
}

module.exports = {
  getKey,
  client,
};
