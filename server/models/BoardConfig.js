import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  name: { type: String, required: true },
  limit: { type: Number, default: null }
}, { _id: false });

const boardConfigSchema = new mongoose.Schema({
  title: { type: String, default: "Sprint Alpha Board" },
  columns: [columnSchema]
});

export default mongoose.model('BoardConfig', boardConfigSchema);
