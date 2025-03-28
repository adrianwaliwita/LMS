import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import v1Router from './api/v1/routes/base.js';
import logger from './utils/logger.js';
import config from './utils/config.js';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>AshBourne SCMS - Backend API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
          h1, h2 { color: #333; }
          ul { margin: 20px 0; }
          li { margin: 10px 0; }
          code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Welcome to the AshBourne SCMS - Backend API!</h1>
        
        <h2>v1</h2>
        <ul>
          <li>API available at <code>/v1</code></li>
          <li>View documentation at <code>/v1/docs</code> to get started.</li>
        </ul>
      </body>
    </html>
  `);
});

// API Routes
app.use('/v1', v1Router);

// Set port and start server;
app.listen(config.port, () => {
  logger.info(`[server] AshBourne SCMS - Backend API service is running at 'http://localhost:${config.port}'`);
  logger.info(`[server] View documentation for '/v1' API at 'http://localhost:${config.port}/v1/docs' to get started.`);
});
