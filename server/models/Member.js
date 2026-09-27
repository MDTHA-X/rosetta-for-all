import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, default: 'Member' },
  status: { type: String, default: 'online' },
  customStatus: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Member', memberSchema);
