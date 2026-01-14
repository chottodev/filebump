/**
 * Кэш для отслеживания использованных nonce (защита от replay-атак)
 * Использует in-memory хранилище с TTL
 */
class NonceCache {
  constructor() {
    this.cache = new Map();
    this.cleanupInterval = 5 * 60 * 1000; // 5 минут
    this.ttl = 60 * 60 * 1000; // 1 час
    
    // Периодическая очистка старых записей
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Проверка и сохранение nonce
   * @param {string} nonce - nonce из токена
   * @param {string} sub - subject (user ID)
   * @param {number} iat - issued at timestamp
   * @returns {boolean} - true если nonce уже использован, false если новый
   */
  checkAndStore(nonce, sub, iat) {
    if (!nonce) {
      return false; // Если nonce отсутствует, пропускаем проверку
    }

    const key = `nonce:${sub}:${iat}`;
    const now = Date.now();
    
    // Проверка существования
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      // Проверяем что nonce совпадает
      if (entry.nonce === nonce) {
        return true; // Уже использован
      }
      // Разные nonce с одним ключом - это ошибка
      return true; // Считаем как использованный для безопасности
    }

    // Сохраняем новый nonce
    this.cache.set(key, {
      nonce,
      sub,
      iat,
      expiresAt: now + this.ttl,
    });

    return false; // Новый nonce
  }

  /**
   * Очистка истекших записей
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Очистка всего кэша (для тестирования)
   */
  clear() {
    this.cache.clear();
  }
}

module.exports = new NonceCache();
