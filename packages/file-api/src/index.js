const config = require('./config');
const {createApp} = require('./app');

const {FileApiLog, File, Meta, Bucket} = require('@filebump/models');

const app = createApp({
  FileApiLog,
  File,
  Meta,
  Bucket,
});

app.listen(config.port, () => {
  console.log('app started with config:', config);
});
