// const config = require('config');
const express = require('express');
const cors = require('cors');
const openapi = require('express-openapi');
const fileUpload = require('express-fileupload');
// const checkAuthHeader = require('check-auth-header');

function createApp({
  FileApiLog,
  File,
  Meta,
}) {
  const app = express();

  // const authHeader = config.authHeader || 'X-API-Key';
  // const authFn = (key) => {
  //   if (!key) return false;
  //   return config.keys.includes(key);
  // };
  app.use(express.json());
  app.use(cors());
  app.use(fileUpload());
  // app.use(
  //     checkAuthHeader({
  //       authFn,
  //       authHeader,
  //       excludes: [],
  //       status401onFail: true,
  //     }),
  // );
  app.route('/', async (req, res) => {
    res.status(200).json({
      message: 'Hello World!',
    });
  });

  openapi.initialize({
    app: app,
    apiDoc: require('./api-doc.js'),
    docsPath: '/api',
    description: 'Документация FileBump API',
    dependencies: {
      FileApiLog,
      File,
      Meta,
    },
    securityHandlers: {
      token: async function(req, scopes, definition) {
        return true;
      },
    },
    errorMiddleware: function(err, req, res, next) {
      res.send(err);
    },
    paths: [
      {path: '/upload', module: require('./routes/upload')},
      {path: '/download', module: require('./routes/download')},
      {path: '/file/{fileId}', module: require('./routes/file')},
      {path: '/file/{fileId}/{fileName}', module: require('./routes/fileName')},
    ],
    promiseMode: true,
  });

  return app;
};

module.exports = {
  createApp,
};
