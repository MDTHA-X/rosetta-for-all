import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import { authenticateToken } from './middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Router Setup
const api = express.Router();

// Mount Routes
api.use('/', systemRoutes); // Health, Stats, Dev Reset
api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/auth/users', userRoutes); // To handle legacy `/auth/users` matching `/users`
api.use('/connections', connectionRoutes);
api.use('/channels', channelRoutes);
api.use('/messages', messageRoutes);
api.use('/board', boardRoutes);
api.use('/members', memberRoutes);
api.use('/cards', authenticateToken(true), cardRoutes);

// Mount the API Router on both /api and root / for total flexibility
app.use('/api', api);
app.use('/', api);

// Frontend Static Assets & Fallback
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to Rosetta , CSE-JU</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            html, body {
              width: 100vw;
              height: 100vh;
              background-color: #800000;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
            }
            h1 {
              font-size: 3.5rem;
              font-weight: 800;
              text-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
          </style>
        </head>
        <body>
          <h1>Welcome to Rosetta , CSE-JU</h1>
        </body>
      </html>
    `);
  }
});

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================`);
    console.log(`🚀 Rosetta Hub Server running at http://localhost:${PORT}`);
    console.log(`📦 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`📊 Stats Endpoint: http://localhost:${PORT}/api/stats`);
    console.log(`=============================================`);
  });
});
