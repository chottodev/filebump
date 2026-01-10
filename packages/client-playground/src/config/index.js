require('dotenv').config();

module.exports = {
  port: process.env.PORT || process.env.CLIENT_PLAYGROUND_PORT || 3003,
  env: process.env.NODE_ENV || 'development',
};
