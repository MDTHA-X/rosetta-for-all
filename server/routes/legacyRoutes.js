import express from 'express';
import { db, saveData, sanitizeUser, getInitialData } from '../config/mockDb.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Card from '../models/Card.js';

const api = express.Router();

api.get('/health', (req, res) => {
  const uptime = process.uptime();
  res.status(200).json({
    status: 'ok',
    service: 'Rosetta Unified Hub',
    uptime,
    uptimeSeconds: Math.floor(uptime),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '1.3.0'
  });
});

api.get('/stats', (req, res) => {
  res.status(200).json({
    totalUsers: db.users?.length || 0,
    totalChannels: db.channels?.length || 0,
    totalMembers: db.members?.length || 0,
    totalMessages: db.messages?.length || 0,
    totalCards: db.cards?.length || 0,
    totalConnections: db.connections?.length || 0
  });
});


api.post('/dev/reset', async (req, res) => {
  const { resetDb } = await import('../config/mockDb.js');
  const newDb = resetDb();
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      
      const seedData = (await import('../config/db.js')).default;
      // We don't call connectDB(), we just want to run seedData
      // Actually we can't easily import seedData since it's not exported.
      // Let's just manually reinsert what's in newDb.
      const Card = (await import('../models/Card.js')).default;
      await Card.insertMany(newDb.cards);
      
      const User = (await import('../models/User.js')).default;
      await User.insertMany(newDb.users);
      
      const Channel = (await import('../models/Channel.js')).default;
      await Channel.insertMany(newDb.channels);
      
      const Member = (await import('../models/Member.js')).default;
      await Member.insertMany(newDb.members);
      
      const Message = (await import('../models/Message.js')).default;
      await Message.insertMany(newDb.messages);
      
      const Connection = (await import('../models/Connection.js')).default;
      await Connection.insertMany(newDb.connections);
      
      const BoardConfig = (await import('../models/BoardConfig.js')).default;
      await BoardConfig.create(newDb.boardConfig);
    }
  } catch(e) {
    console.error('Reset error:', e);
  }
  res.status(200).json({ message: 'Database reset to initial state' });
});


import { generateToken } from '../controllers/authController.js';

api.post('/auth/logout', authenticateToken(true), (req, res) => {
  const userId = req.user ? (req.user.id || req.user.userId) : db.users[0].id;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.status = 'offline';
    saveData(db);
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

api.post('/auth/refresh', authenticateToken(true), (req, res) => {
  const userId = req.user ? (req.user.id || req.user.userId) : db.users[0].id;
  const user = db.users.find(u => u.id === userId) || db.users[0];
  const newToken = generateToken(user);
  res.status(200).json({
    token: newToken,
    user: sanitizeUser(user)
  });
});

api.get('/auth/me', authenticateToken(true), (req, res) => {
  const userId = req.user ? (req.user.id || req.user.userId) : db.users[0].id;
  const user = db.users.find(u => u.id === userId) || db.users[0];
  res.status(200).json(sanitizeUser(user));
});

api.patch('/auth/me', authenticateToken(true), (req, res) => {
  const userId = req.user ? (req.user.id || req.user.userId) : db.users[0].id;
  const user = db.users.find(u => u.id === userId) || db.users[0];
  const { name, avatar, role, status, customStatus } = req.body;
  if (name !== undefined) user.name = name.trim();
  if (avatar !== undefined) user.avatar = avatar.trim();
  if (role !== undefined) user.role = role.trim();
  if (status !== undefined) user.status = status;
  if (customStatus !== undefined) user.customStatus = customStatus;

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

api.patch('/auth/me/password', authenticateToken(true), async (req, res) => {
  const userId = req.user ? (req.user.id || req.user.userId) : db.users[0].id;
  const user = db.users.find(u => u.id === userId) || db.users[0];
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  let isMatch = false;
  if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
    const bcrypt = await import('bcryptjs');
    isMatch = await bcrypt.compare(currentPassword.trim(), user.password);
  } else {
    isMatch = user.password === currentPassword.trim();
  }

  if (!isMatch) {
    return res.status(401).json({ error: 'Current password does not match' });
  }

  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword.trim(), salt);
  saveData(db);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

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

api.get('/auth/users', handleGetUsers);
api.get('/users', handleGetUsers);

const handleGetUserById = (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(sanitizeUser(user));
};

api.get('/auth/users/:id', handleGetUserById);
api.get('/users/:id', handleGetUserById);

// ----------------------------------------------------------------------------

api.get('/connections', authenticateToken(true), (req, res) => {
  const userId = req.user ? req.user.id : (req.userId || 'u-1');

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

api.post('/connections/request', authenticateToken(true), (req, res) => {
  const senderId = req.user ? req.user.id : (req.userId || 'u-1');
  const receiverId = req.body.targetUserId || req.body.receiverId;

  if (!receiverId) {
    return res.status(400).json({ error: 'targetUserId is required' });
  }
  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send connection request to yourself' });
  }

  const existing = db.connections.find(
    c => (c.senderId === senderId && c.receiverId === receiverId) ||
         (c.senderId === receiverId && c.receiverId === senderId)
  );

  if (existing) {
    return res.status(409).json({ error: 'Connection request already exists', connection: existing });
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

api.patch('/connections/:id', authenticateToken(true), (req, res) => {
  const { id } = req.params;
  const { action, status } = req.body;
  const currentUserId = req.user ? req.user.id : (req.userId || 'u-1');

  const conn = db.connections.find(c => c.id === id);
  if (!conn) {
    return res.status(404).json({ error: 'Connection request not found' });
  }

  const isAccept = action === 'accept' || status === 'accepted';
  const isDecline = action === 'decline' || action === 'reject' || status === 'declined' || status === 'rejected';

  if (isAccept) {
    if (conn.status === 'declined' || conn.status === 'rejected' || (conn.receiverId && conn.receiverId !== currentUserId)) {
      return res.status(403).json({ error: 'Cannot accept request' });
    }
    conn.status = 'accepted';
  } else if (isDecline) {
    conn.status = 'declined';
  } else {
    return res.status(400).json({ error: 'Action must be accept or decline' });
  }

  conn.updatedAt = new Date().toISOString();
  saveData(db);
  res.status(200).json(conn);
});

api.delete('/connections/:id', authenticateToken(true), (req, res) => {
  const index = db.connections.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(200).json({ success: true, deletedId: req.params.id });
  }
  const deleted = db.connections.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: 'Connection removed successfully', deletedId: deleted.id });
});

// ----------------------------------------------------------------------------

api.get('/channels', (req, res) => {
  res.status(200).json(db.channels);
});

api.get('/channels/unread', authenticateToken(true), (req, res) => {
  const userId = req.user ? req.user.id : (req.userId || 'u-1');
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

api.get('/channels/:id', (req, res) => {
  const channel = db.channels.find(c => c.id === req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  res.status(200).json(channel);
});

api.post('/channels', authenticateToken(true), (req, res) => {
  const { name, description, category } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

  const duplicate = db.channels.find(c => c.name.toLowerCase() === cleanName);
  if (duplicate) {
    return res.status(409).json({ error: 'Channel with this name already exists' });
  }

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

api.patch('/channels/:id', authenticateToken(true), (req, res) => {
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

api.delete('/channels/:id', authenticateToken(true), (req, res) => {
  const index = db.channels.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  const deleted = db.channels.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: `Channel #${deleted.name} deleted successfully`, deletedId: deleted.id });
});

api.post('/channels/:id/read', authenticateToken(true), (req, res) => {
  const channelId = req.params.id;
  const userId = req.user ? req.user.id : (req.userId || 'u-1');

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

// ----------------------------------------------------------------------------

api.get('/messages', authenticateToken(true), (req, res) => {
  const { channelId, before, limit } = req.query;
  if (!channelId) {
    return res.status(400).json({ error: 'channelId query parameter is required' });
  }

  let results = db.messages.filter(m => m.channelId === channelId);
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

  res.status(200).json({
    messages: results,
    hasMore: false
  });
});

api.get('/messages/:id', authenticateToken(true), (req, res) => {
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.status(200).json(msg);
});

api.post('/messages', authenticateToken(true), (req, res) => {
  const { channelId, text } = req.body;
  const senderId = req.user ? req.user.id : (req.userId || 'u-1');

  if (!channelId) {
    return res.status(400).json({ error: 'channelId is required' });
  }
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'text is required' });
  }

  const user = db.users?.find(u => u.id === senderId) || db.members.find(m => m.id === senderId);
  const senderName = user ? user.name : 'Tanjim Hossen';
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

api.patch('/messages/:id', authenticateToken(true), (req, res) => {
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const { text } = req.body;
  const currentUserId = req.user ? req.user.id : (req.userId || 'u-1');

  // Verify ownership: if message belongs to another user -> 403
  if (msg.senderId && msg.senderId !== currentUserId) {
    return res.status(403).json({ error: "Cannot edit another user's message" });
  }

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  msg.text = text.trim();
  msg.edited = true;
  msg.isEdited = true;
  msg.updatedAt = new Date().toISOString();

  saveData(db);
  res.status(200).json(msg);
});

api.delete('/messages/:id', authenticateToken(true), (req, res) => {
  const index = db.messages.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const currentUserId = req.user ? req.user.id : (req.userId || 'u-1');
  const msg = db.messages[index];

  // Verify ownership: if message belongs to another user -> 403
  if (msg.senderId && msg.senderId !== currentUserId) {
    return res.status(403).json({ error: "Cannot delete another user's message" });
  }

  const deleted = db.messages.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: 'Message deleted successfully', deletedId: deleted.id });
});

// ----------------------------------------------------------------------------

api.get('/board/config', authenticateToken(true), (req, res) => {
  const config = db.boardConfig || getInitialData().boardConfig;
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

api.patch('/board/config', authenticateToken(true), (req, res) => {
  const { title, columns } = req.body;
  if (!db.boardConfig) db.boardConfig = getInitialData().boardConfig;
  
  if (title !== undefined) db.boardConfig.title = title.trim();
  if (Array.isArray(columns)) {
    columns.forEach(col => {
      const existing = db.boardConfig.columns.find(c => c.id === col.id);
      if (existing) {
        if (col.name !== undefined) {
          existing.name = col.name;
          existing.title = col.name;
        }
        if (col.title !== undefined) {
          existing.title = col.title;
          existing.name = col.title;
        }
        if (col.limit !== undefined) existing.limit = col.limit ? parseInt(col.limit, 10) : null;
      } else {
        db.boardConfig.columns.push({
          id: col.id,
          name: col.name || col.title || col.id,
          title: col.title || col.name || col.id,
          limit: col.limit !== undefined ? (col.limit ? parseInt(col.limit, 10) : null) : null
        });
      }
    });
  }

  saveData(db);
  res.status(200).json(db.boardConfig);
});

// ----------------------------------------------------------------------------

api.get('/members', (req, res) => {
  res.status(200).json(db.members);
});

api.get('/members/:id', (req, res) => {
  const member = db.members.find(m => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.status(200).json(member);
});

api.post('/members', (req, res) => {
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

api.patch('/members/:id', (req, res) => {
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

api.delete('/members/:id', (req, res) => {
  const index = db.members.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  const deleted = db.members.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ message: `Member "${deleted.name}" removed successfully`, deletedId: deleted.id });
});


export default api;
