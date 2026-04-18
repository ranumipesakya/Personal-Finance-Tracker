import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  emoji: { type: String, default: '🎯' },
  deadline: { type: Date },
  color: { type: String, default: '#4f46e5' },
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
