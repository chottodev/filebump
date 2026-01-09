const express = require('express');
const config = require('config');
const path = require('path');
const session = require('express-session');
const favicon = require('serve-favicon');
const mobilonAppApi = require('@mobilon/wa_platform_auth');

const app = express();
app.use(session({
  secret: 'uytjgfnvb5324',
  resave: true,
  saveUninitialized: true,
}));

app.use(mobilonAppApi(config.get('apps.admin-web.auth')).middleware());
app.use(favicon(path.join(__dirname, 'images', 'favicon.ico')));

// app.use((req, res, next) => {
//   // console.log(req.account.id);
//   if (Number(req.account.id) !== 32) {
//     console.log('not mobilon account', req.account.id);
//     return res.redirect('https://connect.mobilon.ru/');
//   }
//   next();
// });

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use('/static', express['static'](path.join(__dirname, '../../node_modules')));
app.use('/public', express['static'](path.join(__dirname, '/public')));
app.use(express.json({limit: '2MB'}));
app.use(require('./routes'));

const bootstrap = async () => {
  try {
    app.listen(config.get('apps.admin-web.port'), () => {
      console.log('start web with config', config);
    });
  } catch (e) {
    console.log('catch error, process exit 1,', e);
    process.exit(1);
  }
};

(bootstrap)();
