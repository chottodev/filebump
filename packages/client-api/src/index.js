const config = require('./config');
const {createApp} = require('./app');

const {FileApiLog, File} = require('@filebump/models');

const app = createApp({
  FileApiLog,
  File,
});

app.listen(config.port, () => {
  console.log('app started with config:', config);
});
