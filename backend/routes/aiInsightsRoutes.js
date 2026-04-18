import express from 'express';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });
    const budgets = await Budget.find({ userId: req.user._id });

    // Simple ML / Smart Logic for Insights
    const insights = [];

    // 1. Overspending detection against budget
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthTransactions = transactions.filter(t => t.date.toISOString().slice(0, 7) === currentMonth && t.type === 'expense');

    const expensesByCategory = {};
    currentMonthTransactions.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    budgets.forEach(budget => {
      if (budget.month === currentMonth) {
        const spent = expensesByCategory[budget.category] || 0;
        if (spent > budget.limit) {
          insights.push({
            type: 'alert',
            message: `You have exceeded your budget for ${budget.category}. Limit: ${budget.limit}, Spent: ${spent}.`
          });
        } else if (spent > budget.limit * 0.8) {
          insights.push({
            type: 'warning',
            message: `You are nearing your budget limit for ${budget.category}. Spent: ${((spent/budget.limit)*100).toFixed(1)}%.`
          });
        }
      }
    });

    // 2. Spending Pattern Detection (Current Month vs Last Month)
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const lastMonth = d.toISOString().slice(0, 7); // previous YYYY-MM
    const lastMonthTransactions = transactions.filter(t => t.date.toISOString().slice(0, 7) === lastMonth && t.type === 'expense');

    const lastMonthExpensesByCategory = {};
    lastMonthTransactions.forEach(t => {
      lastMonthExpensesByCategory[t.category] = (lastMonthExpensesByCategory[t.category] || 0) + t.amount;
    });

    Object.keys(expensesByCategory).forEach(category => {
      const currentSpent = expensesByCategory[category];
      const lastSpent = lastMonthExpensesByCategory[category] || 0;
      if (lastSpent > 0 && currentSpent > lastSpent * 1.3) {
        insights.push({
          type: 'insight',
          message: `Your spending on ${category} is 30% higher than last month. Consider reducing it.`
        });
      }
    });

    // 3. Upcoming prediction (Simple Moving Average)
    const allMonthsExpenses = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const m = t.date.toISOString().slice(0, 7);
      allMonthsExpenses[m] = (allMonthsExpenses[m] || 0) + t.amount;
    });
    const months = Object.keys(allMonthsExpenses).sort();
    if (months.length >= 2) {
      const recent = months.slice(-3); // up to 3 months
      const avg = recent.reduce((sum, m) => sum + allMonthsExpenses[m], 0) / recent.length;
      insights.push({
        type: 'prediction',
        message: `Based on your recent habits, expect to spend around ${avg.toFixed(2)} next month.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        message: 'Your spending is well within normal limits!'
      });
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
