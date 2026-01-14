require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.ADMIN_BACKEND_PORT || 33033,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB
  logsMongodb: process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.MONGODB_DATA || 'mongodb://mongodb/filebump-files',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'filebump-admin-secret',
  
  // Auth Service (OIDC)
  authEnabled: true, //process.env.ENABLE_AUTH === 'true' || process.env.AUTH_ENABLED === 'true',
  authProviderUrl: process.env.AUTH_PROVIDER_URL || 'http://localhost:3000',
  authClientId: process.env.AUTH_CLIENT_ID || 'filebump-admin',
  jwksUri: process.env.JWKS_URI || null, // Если не указан, будет использован ${authProviderUrl}/jwks
  
  // File API URL for UI
  fileApiUrl: process.env.FILE_API_URL || 'http://localhost:3007',
  fileApiKey: process.env.FILE_API_KEYS ? process.env.FILE_API_KEYS.split(',')[0] : 'testKey1',
};
