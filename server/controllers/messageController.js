import { getDb, saveData } from '../data/store.js';

export const getMessages = (req, res) => {
  const db = getDb();
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
};

export const getMessageById = (req, res) => {
  const db = getDb();
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.status(200).json(msg);
};

export const createMessage = (req, res) => {
  const db = getDb();
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
};

export const updateMessage = (req, res) => {
  const db = getDb();
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const { text } = req.body;
  const currentUserId = req.user ? req.user.id : (req.userId || 'u-1');

  // Verify ownership
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
};

export const deleteMessage = (req, res) => {
  const db = getDb();
  const index = db.messages.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const currentUserId = req.user ? req.user.id : (req.userId || 'u-1');
  const msg = db.messages[index];

  // Verify ownership
  if (msg.senderId && msg.senderId !== currentUserId) {
    return res.status(403).json({ error: "Cannot delete another user's message" });
  }

  const deleted = db.messages.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: 'Message deleted successfully', deletedId: deleted.id });
};
