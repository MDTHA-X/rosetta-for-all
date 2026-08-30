import { getDb, saveData } from '../data/store.js';

export const getMembers = (req, res) => {
  const db = getDb();
  res.status(200).json(db.members);
};

export const getMemberById = (req, res) => {
  const db = getDb();
  const member = db.members.find(m => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.status(200).json(member);
};

export const createMember = (req, res) => {
  const db = getDb();
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
};

export const updateMember = (req, res) => {
  const db = getDb();
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
};

export const deleteMember = (req, res) => {
  const db = getDb();
  const index = db.members.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  const deleted = db.members.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ message: `Member "${deleted.name}" removed successfully`, deletedId: deleted.id });
};
