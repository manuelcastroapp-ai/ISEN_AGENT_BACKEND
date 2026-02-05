const serverless = require('serverless-http');
const { createApp } = require('../server');

const app = createApp();

module.exports = serverless(app);
