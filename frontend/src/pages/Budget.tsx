import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, AlertTriangle } from 'lucide-react';

export default function Budget() {
  const { budgets, fetchBudgets, addBudget, transactions, fetchTransactions, formatCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
  }, [fetchBudgets, fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMonth = new Date().toISOString().slice(0, 7);
    await addBudget({ category, limit: Number(limit), month: currentMonth });
    setIsOpen(false);
    setCategory('');
    setLimit('');
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(
    (t: any) => t.date.slice(0, 7) === currentMonth && t.type === 'expense'
  );

  const expensesByCategory = currentMonthTransactions.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Budget Planner</h1>
          <p className="text-muted text-sm mt-1">Set limits and stick to your goals.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Set Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.filter((b: any) => b.month === currentMonth).map((budget: any, i: number) => {
          const spent = expensesByCategory[budget.category] || 0;
          const percentage = Math.min((spent / budget.limit) * 100, 100);
          const isWarning = percentage >= 80;
          const isDanger = percentage >= 100;

          return (
            <motion.div
              key={budget._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-muted" />
                  </div>
                  <div>
                    <h3 className="font-bold">{budget.category}</h3>
                    <p className="text-sm text-muted">Budget: {formatCurrency(budget.limit)}</p>
                  </div>
                </div>
                {isDanger && <AlertTriangle className="w-5 h-5 text-danger" />}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Spent: {formatCurrency(spent)}</span>
                  <span className={`font-semibold ${isDanger ? 'text-danger' : isWarning ? 'text-orange-500' : 'text-success'}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${isDanger ? 'bg-danger' : isWarning ? 'bg-orange-500' : 'bg-primary'}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center p-12 bg-background border border-secondary rounded-2xl">
            <Target className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No budgets set</h3>
            <p className="text-muted mt-1">Set a budget to keep your spending in check.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
             <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-secondary rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <h2 className="text-xl font-bold mb-6">New Budget</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Monthly Limit</label>
                  <input
                    type="number"
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. 500"
                    required
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 text-muted">Cancel</button>
                  <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
