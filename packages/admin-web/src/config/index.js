require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.ADMIN_WEB_PORT || 33033,
  env: process.env.NODE_ENV || 'development',
  
  auth: {
    hostname: process.env.ADMIN_WEB_AUTH_HOSTNAME || 'localhost:33333',
    applicationName: process.env.ADMIN_WEB_AUTH_APPLICATION_NAME || 'filebump_central',
    schema: process.env.ADMIN_WEB_AUTH_SCHEMA || 'http',
    systemApiKey: process.env.ADMIN_WEB_AUTH_SYSTEM_API_KEY || 'testKey',
  },
  
  // MongoDB
  logsMongodb: process.env.LOGS_MONGODB || process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.SETTINGS_MONGODB || process.env.MONGODB_SETTINGS || 'mongodb://mongodb/filebump-files',
};
