import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'rosetta-super-secret-key-2026';

app.use(cors());
app.use(express.json());

// Token generation & verification helpers
function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifyToken(tokenString) {
  if (!tokenString) return null;
  const parts = tokenString.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Optional / Required Authentication Middleware
function authenticateToken(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.userId = decoded.userId;
        req.tokenPayload = decoded;
        const user = db.users.find(u => u.id === decoded.userId);
        if (user) req.user = user;
        return next();
      }
    }

    // Fallback: Check header x-user-id or query userId / body senderId for compatibility
    const fallbackUserId = req.headers['x-user-id'] || req.query.userId || (req.body && (req.body.senderId || req.body.userId));
    if (fallbackUserId) {
      const user = db.users.find(u => u.id === fallbackUserId);
      if (user) {
        req.userId = user.id;
        req.user = user;
        return next();
      }
    }

    if (required) {
      return res.status(401).json({ error: true, message: 'Authentication required. Invalid or missing token.' });
    }
    next();
  };
}

// Initial Seed Data
const getInitialData = () => ({
  boardConfig: {
    title: "Sprint Alpha Board",
    columns: [
      { id: "todo", title: "To Do", name: "To Do", limit: null },
      { id: "in-progress", title: "In Progress", name: "In Progress", limit: 3 },
      { id: "review", title: "Review", name: "Review", limit: 4 },
      { id: "done", title: "Done", name: "Done", limit: null }
    ]
  },
  channelReads: [],
  users: [
    { id: "u-1", name: "Tanjim Hossen", email: "tanjim@example.com", username: "tanjim", password: "password123", role: "Admin", status: "online", customStatus: "Building Rosetta 🚀", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "u-2", name: "Alex Rivera", email: "alex@example.com", username: "arivera", password: "password123", role: "Lead Developer", status: "online", customStatus: "Refactoring APIs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "u-3", name: "Sarah Chen", email: "sarah@example.com", username: "schen", password: "password123", role: "Product Designer", status: "idle", customStatus: "Designing Kanban UI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "u-4", name: "Marcus Vance", email: "marcus@example.com", username: "mvance", password: "password123", role: "QA Engineer", status: "dnd", customStatus: "Testing Known Network", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() }
  ],
  connections: [
    { id: "conn-1", senderId: "u-1", receiverId: "u-2", status: "accepted", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "conn-2", senderId: "u-1", receiverId: "u-3", status: "accepted", createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: "conn-3", senderId: "u-4", receiverId: "u-1", status: "pending", createdAt: new Date().toISOString() }
  ],
  channels: [
    { id: "c-1", name: "general", description: "General community and team discussions", category: "Text Channels", isDefault: true, createdAt: new Date().toISOString() },
    { id: "c-2", name: "dev-talk", description: "Engineering, architecture, and code reviews", category: "Text Channels", isDefault: false, createdAt: new Date().toISOString() },
    { id: "c-3", name: "announcements", description: "Official updates and release notices", category: "Information", isDefault: false, createdAt: new Date().toISOString() }
  ],
  members: [
    { id: "m-1", name: "Tanjim Hossen", email: "tanjim@example.com", username: "tanjim", role: "Admin", status: "online", customStatus: "Building Rosetta 🚀", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "m-2", name: "Alex Rivera", email: "alex@example.com", username: "arivera", role: "Lead Developer", status: "online", customStatus: "Refactoring APIs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "m-3", name: "Sarah Chen", email: "sarah@example.com", username: "schen", role: "Product Designer", status: "idle", customStatus: "Designing Kanban UI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() },
    { id: "m-4", name: "Marcus Vance", email: "marcus@example.com", username: "mvance", role: "QA Engineer", status: "dnd", customStatus: "Testing Known Network", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", createdAt: new Date().toISOString() }
  ],
  messages: [
    { id: "msg-1", channelId: "c-1", memberId: "u-1", senderId: "u-1", senderName: "Tanjim Hossen", senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", text: "Welcome to Rosetta! Messages and Board stand side-by-side.", edited: false, isEdited: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "msg-2", channelId: "c-1", memberId: "u-2", senderId: "u-2", senderName: "Alex Rivera", senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", text: "You can edit your messages and customize board names at any time.", edited: false, isEdited: false, timestamp: new Date(Date.now() - 1800000).toISOString() }
  ],
  cards: [
    { id: "card-1", title: "Setup Azure VPS Deployment", description: "Configure Docker Compose, reverse proxy, and SSL on VM 40.83.100.54", list: "done", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen", createdAt: new Date().toISOString() },
    { id: "card-2", title: "Build Side-by-Side Dual Pane", description: "Place Messages & Board side by side with collapsible controls", list: "done", priority: "urgent", assignee: "u-2", assignedTo: "u-2", assigneeName: "Alex Rivera", createdAt: new Date().toISOString() },
    { id: "card-3", title: "Implement User Auth & Known Network", description: "Allow users to register with email, login, and send friend/known requests", list: "in-progress", priority: "high", assignee: "u-1", assignedTo: "u-1", assigneeName: "Tanjim Hossen", createdAt: new Date().toISOString() },
    { id: "card-4", title: "Automated API Regression Gates", description: "Maintain 100 Postman assertions across all endpoints", list: "todo", priority: "medium", assignee: "u-4", assignedTo: "u-4", assigneeName: "Marcus Vance", createdAt: new Date().toISOString() }
  ]
});

// Persistence helpers
function loadData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.boardConfig) parsed.boardConfig = getInitialData().boardConfig;
    if (!parsed.users) parsed.users = getInitialData().users;
    if (!parsed.connections) parsed.connections = getInitialData().connections;
    if (!parsed.channelReads) parsed.channelReads = [];
    if (!parsed.cards) parsed.cards = getInitialData().cards;
    if (!parsed.channels) parsed.channels = getInitialData().channels;
    if (!parsed.messages) parsed.messages = getInitialData().messages;
    if (!parsed.members) parsed.members = getInitialData().members;
    return parsed;
  } catch (err) {
    console.error('Error loading data:', err);
    return getInitialData();
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

let db = loadData();

// Utility helper to strip sensitive fields
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

// ============================================================================
// 1. SYSTEM ENDPOINTS
// ============================================================================
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  res.status(200).json({
    status: 'ok',
    service: 'Rosetta Unified Hub',
    uptime: process.uptime(),
    uptimeSeconds,
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '1.3.0'
  });
});

app.get('/api/stats', (req, res) => {
  res.status(200).json({
    totalUsers: db.users?.length || 0,
    totalChannels: db.channels?.length || 0,
    totalMembers: db.members?.length || 0,
    totalMessages: db.messages?.length || 0,
    totalCards: db.cards?.length || 0,
    totalConnections: db.connections?.length || 0
  });
});

// ============================================================================
// 2. AUTH & USERS ENDPOINTS
// ============================================================================
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, name, role, avatar } = req.body;
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: 'Username, email, password, and name are required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  const existing = db.users.find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const existingEmail = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    password: password.trim(),
    role: role || 'Member',
    status: 'online',
    customStatus: 'Exploring Rosetta 🚀',
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.members.push({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
    status: newUser.status,
    customStatus: newUser.customStatus,
    avatar: newUser.avatar,
    createdAt: newUser.createdAt
  });

  saveData(db);

  const safeUser = sanitizeUser(newUser);
  const token = generateToken(newUser);

  // Return both standalone safeUser fields and { token, user } structure for full compatibility
  res.status(201).json({
    token,
    user: safeUser,
    ...safeUser
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, email, identifier, password } = req.body;
  const loginId = (identifier || username || email || '').trim().toLowerCase();

  if (!loginId || !password) {
    return res.status(400).json({ error: 'Identifier/username and password are required' });
  }

  const user = db.users.find(u => 
    u.username.toLowerCase() === loginId || 
    (u.email && u.email.toLowerCase() === loginId)
  );

  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ error: 'Invalid username/email or password' });
  }

  user.status = 'online';
  saveData(db);

  const safeUser = sanitizeUser(user);
  const token = generateToken(user);

  res.status(200).json({
    token,
    user: safeUser,
    ...safeUser
  });
});

app.post('/api/auth/logout', authenticateToken(false), (req, res) => {
  if (req.user) {
    req.user.status = 'offline';
    saveData(db);
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/refresh', authenticateToken(true), (req, res) => {
  const user = req.user || db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const newToken = generateToken(user);
  res.status(200).json({
    token: newToken,
    user: sanitizeUser(user)
  });
});

app.get('/api/auth/me', authenticateToken(true), (req, res) => {
  const user = req.user || db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(sanitizeUser(user));
});

app.patch('/api/auth/me', authenticateToken(true), (req, res) => {
  const user = req.user || db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, avatar, role, status, customStatus } = req.body;
  if (name !== undefined) user.name = name.trim();
  if (avatar !== undefined) user.avatar = avatar.trim();
  if (role !== undefined) user.role = role.trim();
  if (status !== undefined) user.status = status;
  if (customStatus !== undefined) user.customStatus = customStatus;

  // Keep member list in sync
  const member = db.members.find(m => m.id === user.id);
  if (member) {
    if (name !== undefined) member.name = user.name;
    if (avatar !== undefined) member.avatar = user.avatar;
    if (role !== undefined) member.role = user.role;
    if (status !== undefined) member.status = user.status;
    if (customStatus !== undefined) member.customStatus = user.customStatus;
  }

  saveData(db);
  res.status(200).json(sanitizeUser(user));
});

app.patch('/api/auth/me/password', authenticateToken(true), (req, res) => {
  const user = req.user || db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  if (user.password !== currentPassword.trim()) {
    return res.status(401).json({ error: 'Current password does not match' });
  }

  user.password = newPassword.trim();
  saveData(db);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// Users listing (both /api/auth/users and /api/users)
const handleGetUsers = (req, res) => {
  const term = (req.query.search || req.query.q || '').toLowerCase();
  let list = db.users.map(sanitizeUser);
  if (term) {
    list = list.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.username.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  }
  res.status(200).json(list);
};

app.get('/api/auth/users', handleGetUsers);
app.get('/api/users', handleGetUsers);

// User by ID
const handleGetUserById = (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(sanitizeUser(user));
};

app.get('/api/auth/users/:id', handleGetUserById);
app.get('/api/users/:id', handleGetUserById);

// ============================================================================
// 3. CONNECTIONS ("KNOWN CONTACTS") ENDPOINTS
// ============================================================================
app.get('/api/connections', authenticateToken(false), (req, res) => {
  const userId = req.userId || req.query.userId || (req.user && req.user.id);
  if (!userId) {
    return res.status(400).json({ error: 'userId query param or auth token is required' });
  }

  const acceptedConns = db.connections.filter(
    c => (c.senderId === userId || c.receiverId === userId) && c.status === 'accepted'
  );

  const accepted = acceptedConns.map(c => {
    const otherUserId = c.senderId === userId ? c.receiverId : c.senderId;
    const otherUser = db.users.find(u => u.id === otherUserId);
    return {
      id: c.id,
      user: sanitizeUser(otherUser),
      createdAt: c.createdAt
    };
  });

  const incoming = db.connections
    .filter(c => c.receiverId === userId && c.status === 'pending')
    .map(c => {
      const sender = db.users.find(u => u.id === c.senderId);
      return {
        id: c.id,
        user: sanitizeUser(sender),
        createdAt: c.createdAt
      };
    });

  const outgoing = db.connections
    .filter(c => c.senderId === userId && c.status === 'pending')
    .map(c => {
      const receiver = db.users.find(u => u.id === c.receiverId);
      return {
        id: c.id,
        user: sanitizeUser(receiver),
        createdAt: c.createdAt
      };
    });

  // Also include backward-compatible known array
  const knownUsers = accepted.map(a => a.user).filter(Boolean);

  res.status(200).json({
    accepted,
    incoming,
    outgoing,
    known: knownUsers,
    pendingIncoming: incoming,
    pendingOutgoing: outgoing
  });
});

app.post('/api/connections/request', authenticateToken(false), (req, res) => {
  const senderId = req.userId || req.body.senderId;
  const receiverId = req.body.targetUserId || req.body.receiverId;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'senderId/token and targetUserId/receiverId are required' });
  }
  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send connection request to yourself' });
  }

  const existing = db.connections.find(
    c => (c.senderId === senderId && c.receiverId === receiverId) ||
         (c.senderId === receiverId && c.receiverId === senderId)
  );

  if (existing) {
    return res.status(409).json({ error: 'A connection or request already exists between these users', connection: existing });
  }

  const newConn = {
    id: `conn-${Date.now()}`,
    senderId,
    receiverId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.connections.push(newConn);
  saveData(db);
  res.status(201).json(newConn);
});

app.patch('/api/connections/:id', authenticateToken(false), (req, res) => {
  const { id } = req.params;
  const { action, status } = req.body;

  const resolvedStatus = (action === 'accept' || status === 'accepted') ? 'accepted' :
                         (action === 'decline' || action === 'reject' || status === 'rejected') ? 'rejected' : null;

  const conn = db.connections.find(c => c.id === id);
  if (!conn) {
    return res.status(404).json({ error: 'Connection request not found' });
  }

  if (!resolvedStatus) {
    return res.status(400).json({ error: 'Action must be accept/decline or status must be accepted/rejected' });
  }

  conn.status = resolvedStatus;
  conn.updatedAt = new Date().toISOString();
  saveData(db);
  res.status(200).json(conn);
});

app.delete('/api/connections/:id', authenticateToken(false), (req, res) => {
  const index = db.connections.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Connection not found' });
  }
  const deleted = db.connections.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: 'Connection removed successfully', deletedId: deleted.id });
});

// ============================================================================
// 4. CHANNELS ENDPOINTS
// ============================================================================
app.get('/api/channels', (req, res) => {
  res.status(200).json(db.channels);
});

app.get('/api/channels/unread', authenticateToken(false), (req, res) => {
  const userId = req.userId || req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter or auth token is required' });
  }

  if (!db.channelReads) db.channelReads = [];

  const unreadData = db.channels.map(ch => {
    const record = db.channelReads.find(r => r.userId === userId && r.channelId === ch.id);
    const lastReadTime = record ? new Date(record.lastReadAt).getTime() : 0;
    const channelMsgs = db.messages.filter(m => m.channelId === ch.id);
    const unreadMsgs = channelMsgs.filter(m => new Date(m.timestamp).getTime() > lastReadTime);
    return {
      channelId: ch.id,
      unread: unreadMsgs.length > 0,
      unreadCount: unreadMsgs.length
    };
  });

  res.status(200).json(unreadData);
});

app.get('/api/channels/:id', (req, res) => {
  const channel = db.channels.find(c => c.id === req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found', channelId: req.params.id });
  }
  res.status(200).json(channel);
});

app.post('/api/channels', authenticateToken(false), (req, res) => {
  const { name, description, category } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

  const newChannel = {
    id: `c-${Date.now()}`,
    name: cleanName,
    description: description ? description.trim() : 'Channel for team discussions',
    category: category || 'Text Channels',
    isDefault: false,
    createdAt: new Date().toISOString()
  };

  db.channels.push(newChannel);
  saveData(db);
  res.status(201).json(newChannel);
});

app.patch('/api/channels/:id', authenticateToken(false), (req, res) => {
  const channel = db.channels.find(c => c.id === req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  const { name, description, category } = req.body;
  if (name !== undefined) channel.name = name.trim().toLowerCase().replace(/\s+/g, '-');
  if (description !== undefined) channel.description = description.trim();
  if (category !== undefined) channel.category = category.trim();

  saveData(db);
  res.status(200).json(channel);
});

app.delete('/api/channels/:id', authenticateToken(false), (req, res) => {
  const index = db.channels.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  if (db.channels[index].isDefault) {
    return res.status(403).json({ error: 'Cannot delete default general channel' });
  }

  const deleted = db.channels.splice(index, 1)[0];
  // Cascade delete all messages belonging to this channel
  db.messages = db.messages.filter(m => m.channelId !== deleted.id);
  saveData(db);
  res.status(200).json({ success: true, message: `Channel #${deleted.name} deleted successfully`, deletedId: deleted.id });
});

app.post('/api/channels/:id/read', authenticateToken(false), (req, res) => {
  const channelId = req.params.id;
  const userId = req.userId || (req.body && req.body.userId);
  if (!userId) {
    return res.status(400).json({ error: 'userId or auth token is required' });
  }

  if (!db.channelReads) db.channelReads = [];
  const now = new Date().toISOString();
  let record = db.channelReads.find(r => r.userId === userId && r.channelId === channelId);
  if (record) {
    record.lastReadAt = now;
  } else {
    record = { userId, channelId, lastReadAt: now };
    db.channelReads.push(record);
  }

  saveData(db);
  res.status(200).json({ success: true, lastReadAt: now, record });
});

// ============================================================================
// 5. MESSAGES ENDPOINTS
// ============================================================================
app.get('/api/messages', (req, res) => {
  const { channelId, before, limit, format } = req.query;
  let results = [...db.messages];
  if (channelId) {
    results = results.filter(m => m.channelId === channelId);
  }
  if (before) {
    const beforeDate = new Date(before).getTime();
    results = results.filter(m => new Date(m.timestamp).getTime() < beforeDate);
  }
  if (limit) {
    const max = parseInt(limit, 10);
    if (!isNaN(max) && max > 0) {
      results = results.slice(-max);
    }
  }

  if (format === 'paginated' || format === 'object') {
    return res.status(200).json({
      messages: results,
      hasMore: false
    });
  }

  // Return standard array directly for Postman & UI compatibility
  res.status(200).json(results);
});

app.get('/api/messages/:id', (req, res) => {
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.status(200).json(msg);
});

app.post('/api/messages', authenticateToken(false), (req, res) => {
  const { channelId, text } = req.body;
  const senderId = req.userId || req.body.senderId;

  if (!channelId || !senderId || !text || text.trim() === '') {
    return res.status(400).json({ error: 'channelId, senderId, and text are required' });
  }

  const user = db.users?.find(u => u.id === senderId) || db.members.find(m => m.id === senderId);
  const senderName = user ? user.name : 'Unknown User';
  const senderAvatar = user ? user.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';

  const newMsg = {
    id: `msg-${Date.now()}`,
    channelId,
    memberId: senderId,
    senderId,
    senderName,
    senderAvatar,
    text: text.trim(),
    edited: false,
    isEdited: false,
    timestamp: new Date().toISOString()
  };

  db.messages.push(newMsg);
  saveData(db);
  res.status(201).json(newMsg);
});

app.patch('/api/messages/:id', authenticateToken(false), (req, res) => {
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const { text } = req.body;
  const senderId = req.userId || req.body.senderId;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  // Verify ownership if senderId provided or authenticated
  if (senderId && msg.senderId && msg.senderId !== senderId && msg.memberId !== senderId) {
    return res.status(403).json({ error: 'You can only edit your own messages' });
  }

  msg.text = text.trim();
  msg.edited = true;
  msg.isEdited = true;
  msg.updatedAt = new Date().toISOString();

  saveData(db);
  res.status(200).json(msg);
});

app.delete('/api/messages/:id', authenticateToken(false), (req, res) => {
  const index = db.messages.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const deleted = db.messages.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: 'Message deleted successfully', deletedId: deleted.id });
});

// ============================================================================
// 6. BOARD CONFIG ENDPOINTS
// ============================================================================
app.get('/api/board/config', (req, res) => {
  const config = db.boardConfig || getInitialData().boardConfig;
  // Ensure each column has both name and title
  const columns = config.columns.map(c => ({
    id: c.id,
    name: c.name || c.title || c.id,
    title: c.title || c.name || c.id,
    limit: c.limit || null
  }));
  res.status(200).json({
    title: config.title,
    columns
  });
});

app.patch('/api/board/config', authenticateToken(false), (req, res) => {
  const { title, columns } = req.body;
  if (!db.boardConfig) db.boardConfig = getInitialData().boardConfig;
  
  if (title !== undefined) db.boardConfig.title = title.trim();
  if (Array.isArray(columns)) {
    db.boardConfig.columns = columns.map(col => ({
      id: col.id,
      name: col.name || col.title || col.id,
      title: col.title || col.name || col.id,
      limit: col.limit !== undefined ? (col.limit ? parseInt(col.limit, 10) : null) : null
    }));
  }

  saveData(db);
  res.status(200).json(db.boardConfig);
});

// ============================================================================
// 7. CARDS (KANBAN BOARD) ENDPOINTS
// ============================================================================
app.get('/api/cards', (req, res) => {
  const { list, priority, assignee, assignedTo, search, q } = req.query;
  let results = db.cards;
  if (list) results = results.filter(c => c.list === list);
  if (priority) results = results.filter(c => c.priority === priority);
  if (assignee || assignedTo) {
    const targetAssignee = assignee || assignedTo;
    results = results.filter(c => c.assignee === targetAssignee || c.assignedTo === targetAssignee);
  }
  const searchTerm = (search || q || '').toLowerCase();
  if (searchTerm) {
    results = results.filter(c => 
      c.title.toLowerCase().includes(searchTerm) || 
      (c.description && c.description.toLowerCase().includes(searchTerm))
    );
  }
  res.status(200).json(results);
});

app.get('/api/cards/:id', (req, res) => {
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  res.status(200).json(card);
});

app.post('/api/cards', authenticateToken(false), (req, res) => {
  const { title, description, list, priority, assignee, assignedTo } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Card title is required' });
  }

  const finalAssigneeId = assignee || assignedTo || null;
  let assigneeName = 'Unassigned';
  if (finalAssigneeId) {
    const user = db.users?.find(u => u.id === finalAssigneeId) || db.members.find(m => m.id === finalAssigneeId);
    if (user) assigneeName = user.name;
  }

  const validColumns = (db.boardConfig?.columns || []).map(c => c.id);
  const columnList = validColumns.includes(list) ? list : 'todo';

  const newCard = {
    id: `card-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    list: columnList,
    priority: ['urgent', 'high', 'medium', 'low'].includes(priority) ? priority : 'medium',
    assignee: finalAssigneeId,
    assignedTo: finalAssigneeId,
    assigneeName,
    createdAt: new Date().toISOString()
  };

  db.cards.push(newCard);
  saveData(db);
  res.status(201).json(newCard);
});

app.patch('/api/cards/:id', authenticateToken(false), (req, res) => {
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const { title, description, list, priority, assignee, assignedTo } = req.body;
  if (title !== undefined) card.title = title.trim();
  if (description !== undefined) card.description = description.trim();
  if (list !== undefined) card.list = list;
  if (priority !== undefined && ['urgent', 'high', 'medium', 'low'].includes(priority)) card.priority = priority;
  
  if (assignee !== undefined || assignedTo !== undefined) {
    const finalAssignee = assignee !== undefined ? assignee : assignedTo;
    card.assignee = finalAssignee;
    card.assignedTo = finalAssignee;
    const user = db.users?.find(u => u.id === finalAssignee) || db.members.find(m => m.id === finalAssignee);
    card.assigneeName = user ? user.name : 'Unassigned';
  }

  saveData(db);
  res.status(200).json(card);
});

app.delete('/api/cards/:id', authenticateToken(false), (req, res) => {
  const index = db.cards.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Card not found' });
  }
  const deleted = db.cards.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: `Card "${deleted.title}" deleted successfully`, deletedId: deleted.id });
});

// ============================================================================
// 8. MEMBERS COMPATIBILITY ENDPOINTS
// ============================================================================
app.get('/api/members', (req, res) => {
  res.status(200).json(db.members);
});

app.get('/api/members/:id', (req, res) => {
  const member = db.members.find(m => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.status(200).json(member);
});

app.post('/api/members', (req, res) => {
  const { name, username, role, customStatus, avatar } = req.body;
  if (!name || !username) {
    return res.status(400).json({ error: 'Name and username are required' });
  }

  const newMember = {
    id: `m-${Date.now()}`,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    role: role || 'Member',
    status: 'online',
    customStatus: customStatus || 'Working on Rosetta',
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    createdAt: new Date().toISOString()
  };

  db.members.push(newMember);
  saveData(db);
  res.status(201).json(newMember);
});

app.patch('/api/members/:id', (req, res) => {
  const member = db.members.find(m => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const { status, role, customStatus } = req.body;
  if (status) member.status = status;
  if (role) member.role = role;
  if (customStatus !== undefined) member.customStatus = customStatus;

  saveData(db);
  res.status(200).json(member);
});

app.delete('/api/members/:id', (req, res) => {
  const index = db.members.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  const deleted = db.members.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ message: `Member "${deleted.name}" removed successfully`, deletedId: deleted.id });
});

// ============================================================================
// 9. FRONTEND STATIC ASSETS & FALLBACK
// ============================================================================
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Rosetta Hub API</title></head>
        <body style="font-family:sans-serif; background:#0f172a; color:#f8fafc; padding:2rem; text-align:center;">
          <h1>🚀 Rosetta API Service</h1>
          <p>Rosetta Hub is running on port ${PORT}.</p>
          <p><a href="/api/health" style="color:#38bdf8;">Check API Health</a></p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🚀 Rosetta Hub Server running at http://localhost:${PORT}`);
  console.log(`📦 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`📊 Stats Endpoint: http://localhost:${PORT}/api/stats`);
  console.log(`=============================================`);
});
