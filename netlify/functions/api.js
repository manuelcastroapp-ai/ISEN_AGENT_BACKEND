const express = require('express');
const serverless = require('serverless-http');

// Importar el servidor original
const { PenguinAlphaServer } = require('../../server');

// Crear instancia del servidor
const app = new PenguinAlphaServer().app;

// Exportar como serverless function
module.exports = serverless(app);
