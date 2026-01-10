const express = require('express');
const config = require('./config');
const path = require('path');
const session = require('express-session');
const favicon = require('serve-favicon');

const app = express();
app.use(session({
  secret: 'uytjgfnvb5324',
  resave: true,
  saveUninitialized: true,
}));

// Auth middleware removed - @mobilon/wa_platform_auth excluded
// TODO: Implement alternative authentication if needed
app.use((req, res, next) => {
  // Mock auth - set default account/user for development
  req.account = req.account || { id: 1 };
  req.user = req.user || { id: 1 };
  req.relatedApplications = req.relatedApplications || [];
  next();
});
app.use(favicon(path.join(__dirname, '../images', 'favicon.ico')));

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
app.use('/static', express['static'](path.join(__dirname, '../../../node_modules')));
app.use('/public', express['static'](path.join(__dirname, '../public')));
app.use(express.json({limit: '2MB'}));
app.use(require('./routes'));

const bootstrap = async () => {
  try {
    app.listen(config.port, () => {
      console.log('start web with config', config);
    });
  } catch (e) {
    console.log('catch error, process exit 1,', e);
    process.exit(1);
  }
};

(bootstrap)();
