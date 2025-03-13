import express from 'express';
import cors from 'cors';
import apiRoutes from './api/routes/api.js';
import logger from './utils/logger.js';
import config from './utils/config.js';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AshBourne SCMS - Backend API!' });
});

// API Routes
app.use('/api', apiRoutes);

// Set port and start server;
app.listen(config.port, () => {
  logger.info(`[server] AshBourne SCMS - Backend API service is running at 'http://localhost:${config.port}'`);
  logger.info(`[server] Login to the API at 'http://localhost:${config.port}/api/login' to obtain a token.`);
  logger.info(`[server] Use the token to access the API at 'http://localhost:${config.port}/api'`);
});
