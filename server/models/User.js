import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Admin', 'Lead Developer', 'Product Designer', 'QA Engineer', 'Member'], default: 'User' },
  status: { type: String, default: 'online' },
  customStatus: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook: Hash user password before storing it
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Prevent double-hashing if password is already a bcrypt hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to verify password against hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
  // Fallback comparison for plain-text legacy records
  return this.password === candidatePassword;
};

export default mongoose.model('User', userSchema);

