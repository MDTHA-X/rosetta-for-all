// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const initDb = require('./scripts/initDb');
const { verifyToken } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const playerRoutes = require('./routes/playerRoutes');
const roundRoutes = require('./routes/roundRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration - Allows client from different origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8081',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Newman, Postman)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for mobile & dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Token verification middleware applied globally
app.use(verifyToken);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    driver: db.getDriver(),
    version: '1.0.0',
    service: 'Rosetta For All API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/rounds', roundRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UnhandledError]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

let serverInstance = null;

async function startServer() {
  await initDb();
  serverInstance = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Rosetta For All Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database Driver: ${db.getDriver()}`);
    console.log(`🛡️ Rate Limiting: 10 requests / 3 minutes on /api/auth/login`);
    console.log(`=========================================`);
  });
  return serverInstance;
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer,
};
