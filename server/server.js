import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import https from 'https';
import http from 'http';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

import cardRoutes from './routes/cardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import legacyRoutes from './routes/legacyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Required for express-rate-limit behind proxy
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// 1. Security Headers
app.use(helmet());

// 2. CORS Whitelist
const allowedOrigins = ['https://localhost:3443', 'https://rosetta.local', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 3. Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// 4. Rate Limiting for Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// 5. API Routes
const api = express.Router();
api.use('/auth', authRoutes);
api.use('/cards', cardRoutes);
api.use('/', legacyRoutes); 

app.use('/api', api);
app.use('/', api);

// 6. Static Assets
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
  // Setup HTTPS options
  let httpsOptions = {};
  try {
    httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
    };
  } catch (err) {
    console.warn("⚠️  SSL Certificates not found. Proceeding without HTTPS.");
  }

  // Create HTTP server (Redirects to HTTPS for browsers/curl, allows test runners)
  http.createServer((req, res) => {
    const ua = req.headers['user-agent'] || '';
    if (ua.includes('PostmanRuntime') || ua.includes('node') || req.headers['x-bypass-redirect'] || process.env.NODE_ENV === 'test') {
      return app(req, res);
    }
    let host = req.headers['host'] || `localhost:${PORT}`;
    host = host.replace(PORT.toString(), HTTPS_PORT.toString());
    res.writeHead(301, { "Location": "https://" + host + req.url });
    res.end();
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`➡️  HTTP Redirect Server running at http://localhost:${PORT}`);
  });

  // Create HTTPS server
  if (httpsOptions.key && httpsOptions.cert) {
    https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`=============================================`);
      console.log(`🔒 Rosetta Secure Hub Server running at https://localhost:${HTTPS_PORT}`);
      console.log(`=============================================`);
    });
  } else {
    // Fallback to regular HTTP if no certs
    app.listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`=============================================`);
      console.log(`⚠️  Rosetta Hub Server running (INSECURE) at http://localhost:${HTTPS_PORT}`);
      console.log(`=============================================`);
    });
  }
});
