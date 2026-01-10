const express = require('express');
const config = require('./config');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

app.listen(config.port, () => {
  console.log(`Client Playground started on port ${config.port}`);
});
