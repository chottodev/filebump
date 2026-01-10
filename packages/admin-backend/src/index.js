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

// Auth middleware - mock for development
app.use((req, res, next) => {
  req.account = req.account || { id: 1, name: 'Admin' };
  req.user = req.user || { id: 1, name: 'User' };
  req.relatedApplications = req.relatedApplications || [];
  next();
});

app.use(express.json({limit: '2MB'}));
app.use(express.urlencoded({extended: true}));

// Health check (before API routes)
app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

// API routes
app.use('/api/journals', require('./routes/journals'));
app.use('/api/charts', require('./routes/charts'));
app.use('/api/reports', require('./routes/reports'));

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
    });
  } catch (e) {
    console.error('Error starting server:', e);
    process.exit(1);
  }
};

bootstrap();
