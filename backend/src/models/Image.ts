import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true }, 
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Image', imageSchema);