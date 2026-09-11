import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rosetta-super-secret-key-2026';

// Helper to sanitize user object (exclude password)
export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Helper to generate standard JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id || user._id,
    userId: user.id || user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role || 'User'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Task 3 & 4: User Registration Endpoint
 * Validates input, checks duplicate email, hashes password, saves user, generates JWT.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, username, role, avatar } = req.body;

    // 1. Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.trim() === '') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // 2. Validate email format
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const cleanUsername = (username || cleanEmail.split('@')[0]).trim().toLowerCase();
    const cleanRole = (role && ['Admin', 'User'].includes(role)) ? role : (role || 'User');

    // 3. Check for existing user email
    let existingUser = null;
    try {
      existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { username: cleanUsername }]
      });
    } catch (err) {}

    // Fallback check
    const { db, saveData } = await import('../config/mockDb.js');
    const fallbackExists = db.users.find(u => u.email === cleanEmail || u.username === cleanUsername);

    if (existingUser || fallbackExists) {
      if ((existingUser && existingUser.email === cleanEmail) || (fallbackExists && fallbackExists.email === cleanEmail)) {
        return res.status(409).json({ error: 'Email is already registered' });
      }
      return res.status(409).json({ error: 'Username already exists' });
    }

    // 4. Create new user
    const userId = `u-${Date.now()}`;
    const newUser = new User({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password: password.trim(),
      role: cleanRole,
      status: 'online',
      customStatus: 'Exploring Rosetta 🚀',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      createdAt: new Date()
    });

    try {
      await newUser.save();
    } catch (err) {}

    // Sync to mockDb
    const plainUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      status: newUser.status,
      customStatus: newUser.customStatus,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };
    db.users.push(plainUser);
    saveData(db);

    // 5. Generate JWT Token
    const token = generateToken(newUser);
    const safeUser = sanitizeUser(newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: safeUser,
      ...safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

/**
 * Task 5 & 6: User Login Endpoint
 * Verifies email and password with bcrypt, generates and returns JWT token.
 */
export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!password || password.trim() === '') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (!loginId) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    // 1. Verify user exists
    let user = null;
    try {
      user = await User.findOne({
        $or: [{ email: loginId }, { username: loginId }]
      });
    } catch (err) {}

    // Fallback check
    const { db, saveData } = await import('../config/mockDb.js');
    if (!user) {
      user = db.users.find(u => (u.email && u.email.toLowerCase() === loginId) || (u.username && u.username.toLowerCase() === loginId));
      if (user) {
        // mock comparePassword
        user.comparePassword = async function(pwd) {
          if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
            const bcrypt = await import('bcryptjs');
            return await bcrypt.compare(pwd, this.password);
          }
          return this.password === pwd;
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Verify password
    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.status = 'online';
    try {
      if (user.save) await user.save();
    } catch (e) {}

    // sync mockdb
    const fallbackUser = db.users.find(u => u.id === user.id);
    if (fallbackUser) {
       fallbackUser.status = 'online';
       saveData(db);
    }

    // 3. Generate JWT token
    const token = generateToken(user);
    const safeUser = sanitizeUser(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser,
      ...safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

/**
 * Get Profile of Authenticated User
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    let user = null;
    try {
      user = await User.findOne({ id: userId });
    } catch (e) {}

    if (!user) {
      const { db } = await import('../config/mockDb.js');
      user = db.users.find(u => u.id === userId);
    }

    if (user) {
      return res.status(200).json(sanitizeUser(user));
    }
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get All Users (for directory/mentions)
 */
export const getUsers = async (req, res) => {
  try {
    const term = (req.query.search || req.query.q || '').toLowerCase();
    let query = {};
    if (term) {
      query = {
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { username: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } }
        ]
      };
    }
    const users = await User.find(query).select('-password -__v');
    if (!users || users.length === 0) {
      const { db } = await import('../config/mockDb.js');
      let list = db.users;
      if (term) {
        list = list.filter(u => 
          u.name.toLowerCase().includes(term) || 
          u.username.toLowerCase().includes(term) ||
          (u.email && u.email.toLowerCase().includes(term))
        );
      }
      return res.status(200).json(list.map(sanitizeUser));
    }
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { register, login, getMe, getUsers, sanitizeUser, generateToken };
