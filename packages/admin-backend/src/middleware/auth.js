const jwt = require('jsonwebtoken');
const config = require('../config');
const jwksService = require('../services/jwks');
const nonceCache = require('../services/nonceCache');

/**
 * JWT валидация middleware согласно AUTH_CONCEPT.md
 * Валидирует JWT токены через JWKS endpoint
 */
async function validateJWT(req, res, next) {
  // 1. Извлечение токена из Authorization header (RFC 6750 Section 2.1)
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.substring(7); // Убираем "Bearer "

  try {
    // 2. Проверка формата JWT (3 части разделенные точками)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid JWT format',
      });
    }

    // 3. Декодирование header для получения kid
    // JWT использует base64url, но Buffer.from поддерживает base64
    // Нужно заменить - на + и _ на / для base64 декодирования
    let header;
    try {
      const base64Header = parts[0].replace(/-/g, '+').replace(/_/g, '/');
      // Добавляем padding если нужно
      const padded = base64Header + '='.repeat((4 - base64Header.length % 4) % 4);
      header = JSON.parse(Buffer.from(padded, 'base64').toString());
      
      // Логируем kid для отладки
      if (header.kid) {
        console.log(`Validating JWT with kid=${header.kid}`);
      } else {
        console.warn('JWT header missing kid');
      }
    } catch (err) {
      console.error('Error decoding JWT header:', err);
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid JWT header',
      });
    }

    // 4. Валидация через JWKS
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, (header, callback) => {
        jwksService.getKey(header, (err, key) => {
          if (err) {
            // Логируем ошибку для отладки
            if (err.message && err.message.includes('Too many requests')) {
              console.error('JWKS rate limit exceeded. Consider increasing cache or rate limit.');
            }
            return callback(err);
          }
          callback(null, key);
        });
      }, {
        issuer: config.authProviderUrl,
        audience: config.authClientId,
        algorithms: ['RS256'],
      }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    // 5. Проверка exp (expiration)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token expired',
      });
    }

    // 6. Проверка nonce (защита от replay-атак)
    // Согласно AUTH_CONCEPT.md: один токен может использоваться многократно
    // Проверяем только что nonce соответствует токену (через ключ nonce:sub:iat)
    if (decoded.nonce) {
      nonceCache.checkAndStore(
        decoded.nonce,
        decoded.sub,
        decoded.iat
      );
      // Не блокируем повторное использование - только отслеживаем для логирования
    }

    // 7. Извлечение данных пользователя и установка в request
    req.user = {
      sub: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      nonce: decoded.nonce,
    };

    next();
  } catch (error) {
    // Детальное логирование ошибок
    if (error.message) {
      if (error.message.includes('Too many requests')) {
        console.error('JWKS rate limit exceeded');
      } else if (error.message.includes('Not Found')) {
        console.error('JWKS key not found. Possible issues:');
        console.error('  1. JWKS endpoint not accessible:', `${config.authProviderUrl}/jwks`);
        console.error('  2. Key with kid not present in JWKS');
        console.error('  3. Token was signed with different key');
      } else {
        console.error('JWT validation error:', error.message);
        if (error.stack) {
          console.error('Stack:', error.stack);
        }
      }
    } else {
      console.error('JWT validation error (no message):', error);
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: error.message || 'Invalid token',
      });
    }

    // Специальная обработка для rate limiting
    if (error.message && error.message.includes('Too many requests')) {
      // Возвращаем 503 вместо 401, чтобы клиент не редиректил
      return res.status(503).json({
        error: 'service_unavailable',
        error_description: 'JWKS service temporarily unavailable due to rate limiting',
      });
    }

    // Специальная обработка для "Not Found" - возможно JWKS недоступен
    if (error.message && error.message.includes('Not Found')) {
      return res.status(503).json({
        error: 'service_unavailable',
        error_description: 'JWKS key not found. Auth service may be unavailable.',
      });
    }

    return res.status(401).json({
      error: 'invalid_token',
      error_description: error.message || 'Token validation failed',
    });
  }
}

/**
 * Middleware для проверки ролей
 * @param {...string} allowedRoles - Разрешенные роли
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Authentication required',
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        error: 'forbidden',
        error_description: 'User role not found',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'forbidden',
        error_description: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = {
  validateJWT,
  requireRole,
};
