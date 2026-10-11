import { getDb, saveData } from '../data/store.js';

export const getChannels = (req, res) => {
  const db = getDb();
  res.status(200).json(db.channels);
};

export const getUnreadChannels = (req, res) => {
  const db = getDb();
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
};

export const getChannelById = (req, res) => {
  const db = getDb();
  const channel = db.channels.find(c => c.id === req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  res.status(200).json(channel);
};

export const createChannel = (req, res) => {
  const db = getDb();
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
};

export const updateChannel = (req, res) => {
  const db = getDb();
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
};

export const deleteChannel = (req, res) => {
  const db = getDb();
  const index = db.channels.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  const deleted = db.channels.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: `Channel #${deleted.name} deleted successfully`, deletedId: deleted.id });
};

export const markChannelRead = (req, res) => {
  const db = getDb();
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
};
