import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'annually'], default: 'monthly' },
  month: { type: String, required: true }, // format 'YYYY-MM'
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
