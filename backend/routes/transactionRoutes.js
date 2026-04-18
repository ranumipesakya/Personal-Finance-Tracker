import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all transactions for user
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create transaction
router.post('/', protect, async (req, res) => {
  const { type, amount, category, date, description } = req.body;
  
  let finalCategory = category;
  
  // Basic Auto-categorization logic
  if (type === 'expense' && (!category || category === 'Other')) {
    const desc = (description || '').toLowerCase();
    const map = {
      'Food & Dining': ['pizza', 'burger', 'restaurant', 'cafe', 'starbucks', 'kfc', 'mcdonald', 'uber eats', 'doordash', 'grocery', 'supermarket', 'food'],
      'Transportation': ['uber', 'lyft', 'bolt', 'taxi', 'fuel', 'gas', 'bus', 'train', 'flight', 'airline'],
      'Housing': ['rent', 'mortgage', 'home'],
      'Utilities': ['electricity', 'water', 'internet', 'wifi', 'phone', 'bill', 'netflix', 'spotify', 'subscription'],
      'Entertainment': ['cinema', 'movie', 'game', 'playstation', 'xbox', 'concert', 'club'],
    };

    for (const [cat, keywords] of Object.entries(map)) {
      if (keywords.some(k => desc.includes(k))) {
        finalCategory = cat;
        break;
      }
    }
  }

  try {
    const transaction = await Transaction.create({
      userId: req.user._id,
      type, amount, category: finalCategory || 'Other', date: date || Date.now(), description
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Transaction
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Transaction
router.put('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    const { type, amount, category, date, description } = req.body;
    transaction.type = type ?? transaction.type;
    transaction.amount = amount ?? transaction.amount;
    transaction.category = category ?? transaction.category;
    transaction.date = date ?? transaction.date;
    transaction.description = description ?? transaction.description;

    const updated = await transaction.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
