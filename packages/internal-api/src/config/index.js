require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.INTERNAL_API_PORT || 3002,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB
  logsMongodb: process.env.LOGS_MONGODB || process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.SETTINGS_MONGODB || process.env.MONGODB_SETTINGS || 'mongodb://mongodb/filebump-files',
};
