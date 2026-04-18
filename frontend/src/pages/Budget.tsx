import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, AlertTriangle, Calendar, Clock } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly' | 'annually';

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  annually: 'Annually',
};

const PERIOD_ICONS: Record<Period, string> = {
  daily: '📅',
  weekly: '🗓️',
  monthly: '📆',
  annually: '🎯',
};

/** Returns the start of the current period window as a Date */
function getPeriodStart(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'weekly': {
      const day = now.getDay(); // 0 = Sunday
      const diff = now.getDate() - day;
      return new Date(now.getFullYear(), now.getMonth(), diff);
    }
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'annually':
      return new Date(now.getFullYear(), 0, 1);
  }
}

export default function Budget() {
  const { budgets, fetchBudgets, addBudget, transactions, fetchTransactions, formatCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<Period>('monthly');

  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
  }, [fetchBudgets, fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMonth = new Date().toISOString().slice(0, 7);
    await addBudget({ category, limit: Number(limit), period, month: currentMonth });
    setIsOpen(false);
    setCategory('');
    setLimit('');
    setPeriod('monthly');
  };

  /** Compute how much was spent in this budget's period window for its category */
  const getSpentForBudget = (budget: any): number => {
    const bPeriod: Period = budget.period || 'monthly';
    const periodStart = getPeriodStart(bPeriod);
    return (transactions as any[])
      .filter((t) =>
        t.type === 'expense' &&
        t.category === budget.category &&
        new Date(t.date) >= periodStart
      )
      .reduce((sum: number, t: any) => sum + t.amount, 0);
  };

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
        {budgets.map((budget: any, i: number) => {
          const spent = getSpentForBudget(budget);
          const percentage = Math.min((spent / budget.limit) * 100, 100);
          const isWarning = percentage >= 80;
          const isDanger = percentage >= 100;
          const bPeriod: Period = budget.period || 'monthly';

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
                    <p className="text-sm text-muted">Limit: {formatCurrency(budget.limit)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Period badge */}
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <span>{PERIOD_ICONS[bPeriod]}</span>
                    {PERIOD_LABELS[bPeriod]}
                  </span>
                  {isDanger && <AlertTriangle className="w-5 h-5 text-danger" />}
                </div>
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
                <p className="text-xs text-muted mt-2">
                  {formatCurrency(Math.max(budget.limit - spent, 0))} remaining this {PERIOD_LABELS[bPeriod].toLowerCase()}
                </p>
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

      {/* Modal */}
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

                {/* Category */}
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
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Period selector */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Budget Period</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['daily', 'weekly', 'monthly', 'annually'] as Period[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium border transition-all ${
                          period === p
                            ? 'bg-primary/10 border-primary/40 text-primary'
                            : 'bg-secondary/20 border-secondary text-muted hover:border-primary/30'
                        }`}
                      >
                        <span className="text-lg">{PERIOD_ICONS[p]}</span>
                        {PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limit */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">
                    {PERIOD_LABELS[period]} Limit
                  </label>
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
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-muted hover:bg-secondary/50 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Save Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
