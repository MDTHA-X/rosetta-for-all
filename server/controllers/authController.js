import { getDb, saveData, sanitizeUser } from '../data/store.js';
import { generateToken } from '../utils/jwt.js';

export const register = (req, res) => {
  const { username, email, password, name, role, avatar } = req.body;
  const db = getDb();
  
  if (!email || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!username || username.trim() === '' || !password || password.trim() === '' || !name || name.trim() === '') {
    return res.status(400).json({ error: 'Username, email, password, and name are required' });
  }

  const cleanUsername = username.trim().toLowerCase();

  const existingEmail = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  const existingUsername = db.users.find(u => u.username && u.username.toLowerCase() === cleanUsername);
  if (existingUsername) {
    return res.status(409).json({ error: 'Username already exists' });
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

  res.status(201).json({
    token,
    user: safeUser,
    ...safeUser
  });
};

export const login = (req, res) => {
  const { username, email, identifier, password } = req.body;
  const db = getDb();
  const loginId = (identifier || username || email || '').trim().toLowerCase();

  if (!password || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!loginId) {
    return res.status(400).json({ error: 'Username or email is required' });
  }

  const user = db.users.find(u => 
    (u.username && u.username.toLowerCase() === loginId) || 
    (u.email && u.email.toLowerCase() === loginId)
  );

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (user.password !== password.trim()) {
    return res.status(401).json({ error: 'Invalid password' });
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
};

export const logout = (req, res) => {
  const db = getDb();
  if (req.user) {
    req.user.status = 'offline';
    saveData(db);
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const refresh = (req, res) => {
  const db = getDb();
  const user = req.user || db.users[0];
  const newToken = generateToken(user);
  res.status(200).json({
    token: newToken,
    user: sanitizeUser(user)
  });
};

export const getMe = (req, res) => {
  const db = getDb();
  const user = req.user || db.users[0];
  res.status(200).json(sanitizeUser(user));
};

export const updateMe = (req, res) => {
  const db = getDb();
  const user = req.user || db.users[0];
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
};

export const updatePassword = (req, res) => {
  const db = getDb();
  const user = req.user || db.users[0];
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
};
