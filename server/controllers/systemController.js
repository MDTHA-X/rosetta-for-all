import { getDb, getInitialData, saveData, setDb } from '../data/store.js';
import Card from '../models/Card.js';

export const getHealth = (req, res) => {
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
};

export const getStats = (req, res) => {
  const db = getDb();
  res.status(200).json({
    totalUsers: db.users?.length || 0,
    totalChannels: db.channels?.length || 0,
    totalMembers: db.members?.length || 0,
    totalMessages: db.messages?.length || 0,
    totalCards: db.cards?.length || 0,
    totalConnections: db.connections?.length || 0
  });
};

export const resetData = async (req, res) => {
  const newDb = getInitialData();
  setDb(newDb);
  saveData(newDb);
  try {
    await Card.deleteMany({});
    await Card.insertMany(newDb.cards);
  } catch(e) {
    console.error('Reset error:', e);
  }
  res.status(200).json({ message: 'Database reset to initial state' });
};
