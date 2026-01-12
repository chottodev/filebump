const mongoose = require('mongoose');
const config = require('./config');
mongoose.Promise = Promise;

const logsDbConnection = mongoose.createConnection(config.logsMongodb);
const settingsDbConnection = mongoose.createConnection(config.settingsMongodb);

const {FileApiLogSchema} = require('./logs/file-api-log.js');
const {cronTasksLogSchema} = require('./logs/cron-tasks-log.js');
const {FileSchema} = require('./base/File.js');
const {MetaSchema} = require('./base/Meta.js');
const {BucketSchema} = require('./base/Bucket.js');

const FileApiLog = logsDbConnection.model('fileApiLog', FileApiLogSchema);
const CronTaskLog = logsDbConnection.model('cronTasksLog', cronTasksLogSchema);
const File = settingsDbConnection.model('file', FileSchema);
const Meta = settingsDbConnection.model('meta', MetaSchema);
const Bucket = settingsDbConnection.model('bucket', BucketSchema);

module.exports = {
  FileApiLog,
  CronTaskLog,
  File,
  Meta,
  Bucket,
};
