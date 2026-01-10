require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.CLIENT_API_PORT || 3007,
  env: process.env.NODE_ENV || 'development',
  
  baseUrl: process.env.CLIENT_API_BASE_URL || 'http://localhost:3007',
  uploadDir: process.env.CLIENT_API_UPLOAD_DIR || '/tmp/uploads',
  
  authHeader: process.env.CLIENT_API_AUTH_HEADER || 'X-API-Key',
  keys: process.env.CLIENT_API_KEYS ? process.env.CLIENT_API_KEYS.split(',') : ['testKey1', 'testKey2'],
  
  // MongoDB
  logsMongodb: process.env.LOGS_MONGODB || process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.SETTINGS_MONGODB || process.env.MONGODB_SETTINGS || 'mongodb://mongodb/filebump-files',
};
