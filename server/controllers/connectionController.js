import { getDb, saveData, sanitizeUser } from '../data/store.js';

export const getConnections = (req, res) => {
  const db = getDb();
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
};

export const requestConnection = (req, res) => {
  const db = getDb();
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
};

export const updateConnection = (req, res) => {
  const db = getDb();
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
};

export const deleteConnection = (req, res) => {
  const db = getDb();
  const index = db.connections.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(200).json({ success: true, deletedId: req.params.id });
  }
  const deleted = db.connections.splice(index, 1)[0];
  saveData(db);
  res.status(200).json({ success: true, message: 'Connection removed successfully', deletedId: deleted.id });
};
