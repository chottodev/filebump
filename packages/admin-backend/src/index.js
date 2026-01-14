const express = require('express');
const config = require('./config');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'filebump-admin-secret',
  resave: true,
  saveUninitialized: true,
}));

// Mock auth middleware - применяется только если auth выключен
if (!config.authEnabled) {
  app.use((req, res, next) => {
    req.account = req.account || { id: 1, name: 'Admin' };
    req.user = req.user || { id: 1, name: 'User' };
    req.relatedApplications = req.relatedApplications || [];
    next();
  });
}

app.use(express.json({limit: '2MB'}));
app.use(express.urlencoded({extended: true}));

// Health check (before API routes)
app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

// Config endpoint for UI
app.get('/api/config', (req, res) => {
  const response = {
    fileApiUrl: config.fileApiUrl,
    fileApiKey: config.fileApiKey,
  };

  // Добавляем конфигурацию авторизации если включена
  if (config.authEnabled) {
    response.providerUrl = config.authProviderUrl;
    response.clientId = config.authClientId;
  }

  res.json(response);
});

// User endpoint для проверки токена (только если auth включен)
if (config.authEnabled) {
  const {validateJWT} = require('./middleware/auth');
  
  app.get('/api/user', validateJWT, (req, res) => {
    res.json({
      sub: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  });
}

// API routes
let apiAuthMiddleware;
if (config.authEnabled) {
  const {validateJWT} = require('./middleware/auth');
  apiAuthMiddleware = validateJWT;
} else {
  // Mock auth для обратной совместимости
  apiAuthMiddleware = (req, res, next) => {
    req.account = req.account || { id: 1, name: 'Admin' };
    req.user = req.user || { id: 1, name: 'User' };
    req.relatedApplications = req.relatedApplications || [];
    next();
  };
}

app.use('/api/journals', apiAuthMiddleware, require('./routes/journals'));
app.use('/api/charts', apiAuthMiddleware, require('./routes/charts'));
app.use('/api/reports', apiAuthMiddleware, require('./routes/reports'));

// Serve static files from admin-ui build
const fs = require('fs');
const adminUiDistPath = path.join(__dirname, '../dist');
const adminUiExists = fs.existsSync(adminUiDistPath);

if (adminUiExists) {
  // Serve static assets
  app.use(express.static(adminUiDistPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    const indexPath = path.join(adminUiDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Admin UI index.html not found');
    }
  });
} else {
  // Placeholder when admin-ui is not built
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admin Backend</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; }
            pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 0.5rem 0; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>Admin Backend is running</h1>
          <p>Admin UI is not built yet. Build it with:</p>
          <pre>npm run build --workspace=packages/admin-ui</pre>
          <p>API endpoints are available at:</p>
          <ul>
            <li><a href="/api/journals/files">/api/journals/files</a></li>
            <li><a href="/api/journals/api">/api/journals/api</a></li>
            <li><a href="/api/charts/files-api">/api/charts/files-api</a></li>
            <li><a href="/api/reports/files-api">/api/reports/files-api</a></li>
          </ul>
        </body>
      </html>
    `);
  });
}

const bootstrap = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Admin Backend started on port ${config.port}`);
      console.log(`Serving admin-ui from: ${adminUiDistPath}`);
      console.log(`Auth enabled: ${config.authEnabled ? 'YES' : 'NO'}`);
      if (config.authEnabled) {
        console.log(`Auth Provider URL: ${config.authProviderUrl}`);
        console.log(`Auth Client ID: ${config.authClientId}`);
      }
    });
  } catch (e) {
    console.error('Error starting server:', e);
    process.exit(1);
  }
};

bootstrap();
