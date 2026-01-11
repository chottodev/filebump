require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.ADMIN_BACKEND_PORT || 33033,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB
  logsMongodb: process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.MONGODB_SETTINGS || 'mongodb://mongodb/filebump-files',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'filebump-admin-secret',
};
