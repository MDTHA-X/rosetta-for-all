import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  list: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  assignee: { type: String },
  assignedTo: { type: String },
  assigneeName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Card', cardSchema);
