import { getDb, sanitizeUser } from '../data/store.js';

export const getUsers = (req, res) => {
  const db = getDb();
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

export const getUserById = (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(sanitizeUser(user));
};
