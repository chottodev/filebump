require('dotenv').config();

module.exports = {
  logsMongodb: process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.MONGODB_SETTINGS || 'mongodb://mongodb/filebump-files',
};
