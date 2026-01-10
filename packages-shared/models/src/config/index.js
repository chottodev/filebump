require('dotenv').config();

module.exports = {
  logsMongodb: process.env.LOGS_MONGODB || process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.SETTINGS_MONGODB || process.env.MONGODB_SETTINGS || 'mongodb://mongodb/filebump-files',
};
