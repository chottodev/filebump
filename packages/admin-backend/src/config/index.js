require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.ADMIN_BACKEND_PORT || 33033,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB
  logsMongodb: process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.MONGODB_DATA || 'mongodb://mongodb/filebump-files',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'filebump-admin-secret',
  
  // File API URL for UI
  fileApiUrl: process.env.FILE_API_URL || (process.env.NODE_ENV === 'production' ? 'http://file-api:3007' : 'http://localhost:3007'),
  fileApiKey: process.env.FILE_API_KEYS ? process.env.FILE_API_KEYS.split(',')[0] : 'testKey1',
};
