require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  
  clearFilesTask: {
    schedule: process.env.CLEAR_FILES_TASK_SCHEDULE || '0 0 1 * * *',
  },
  
  // MongoDB
  logsMongodb: process.env.MONGODB_LOGS || 'mongodb://mongodb/filebumb-logs',
  settingsMongodb: process.env.MONGODB_DATA || 'mongodb://mongodb/filebump-files',
};
