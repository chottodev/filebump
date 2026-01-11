const config = require('./config');
const {createApp} = require('./app');

const {FileApiLog, File, Meta} = require('@filebump/models');

const app = createApp({
  FileApiLog,
  File,
  Meta,
});

app.listen(config.port, () => {
  console.log('app started with config:', config);
});
