import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  memberId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: '' },
  text: { type: String, required: true },
  edited: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
