import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
  status: { type: String, default: 'offline' },
  customStatus: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
