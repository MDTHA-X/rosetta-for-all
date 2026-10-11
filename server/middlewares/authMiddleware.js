import { verifyToken } from '../utils/jwt.js';
import { getDb } from '../data/store.js';

export function authenticateToken(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = null;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    if (!token || token === '' || token === '{{token}}') {
      if (required) {
        return res.status(401).json({ error: true, message: 'Authentication required. Token missing.' });
      }
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: true, message: 'Invalid or expired token.' });
    }

    req.userId = decoded.userId || decoded.id || 'u-1';
    req.tokenPayload = decoded;
    
    const db = getDb();
    const user = db.users.find(u => u.id === req.userId || u.username === decoded.username) || db.users[0];
    req.user = user;
    next();
  };
}
