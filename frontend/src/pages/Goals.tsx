import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, PiggyBank, Target, CalendarDays, X } from 'lucide-react';

const GOAL_EMOJIS = ['🎯', '🏠', '✈️', '🚗', '💍', '📱', '🎓', '🏋️', '💻', '⛵', '🎸', '🌴'];
const GOAL_COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

function daysLeft(deadline?: string) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function estimateMonths(remaining: number, totalIncome: number, totalExpense: number) {
  const monthlySavings = totalIncome - totalExpense;
  if (monthlySavings <= 0) return null;
  return Math.ceil(remaining / monthlySavings);
}

export default function Goals() {
  const { goals, fetchGoals, addGoal, updateGoal, deleteGoal, formatCurrency, transactions } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [fundModal, setFundModal] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState('#4f46e5');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const totalIncome = (transactions as any[]).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = (transactions as any[]).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({
      name,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount) || 0,
      emoji,
      color,
      deadline: deadline || undefined,
    });
    setIsOpen(false);
    setName(''); setTargetAmount(''); setSavedAmount('');
    setEmoji('🎯'); setColor('#4f46e5'); setDeadline('');
  };

  const handleAddFunds = async () => {
    if (!fundModal || !fundAmount) return;
    const newSaved = Math.min(fundModal.savedAmount + Number(fundAmount), fundModal.targetAmount);
    await updateGoal(fundModal._id, { savedAmount: newSaved });
    setFundModal(null);
    setFundAmount('');
  };

  const completedGoals = goals.filter((g: any) => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-muted text-sm mt-1">
            {completedGoals > 0 ? `🎉 ${completedGoals} goal${completedGoals > 1 ? 's' : ''} completed!` : 'Set goals and track your savings journey.'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {/* Summary bar */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Goals', value: goals.length, icon: '🎯' },
            { label: 'Completed', value: completedGoals, icon: '✅' },
            { label: 'Total Saved', value: formatCurrency((goals as any[]).reduce((s, g) => s + g.savedAmount, 0)), icon: '💰', isAmount: true },
          ].map(stat => (
            <div key={stat.label} className="bg-background border border-secondary rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold">{stat.isAmount ? stat.value : stat.value}</div>
              <div className="text-xs text-muted mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {(goals as any[]).map((goal, i) => {
            const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const remaining = goal.targetAmount - goal.savedAmount;
            const isComplete = pct >= 100;
            const days = daysLeft(goal.deadline);
            const months = remaining > 0 ? estimateMonths(remaining, totalIncome, totalExpense) : null;

            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-background border rounded-2xl p-6 shadow-sm relative overflow-hidden ${isComplete ? 'border-success/40' : 'border-secondary'}`}
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: goal.color }} />

                {isComplete && (
                  <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 bg-success/10 text-success rounded-full border border-success/20">
                    ✓ Complete
                  </div>
                )}

                <div className="flex items-start justify-between mb-4 mt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <h3 className="font-bold leading-tight">{goal.name}</h3>
                      <p className="text-xs text-muted mt-0.5">Target: {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal._id)}
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted text-xs">Saved: <span className="font-semibold text-foreground">{formatCurrency(goal.savedAmount)}</span></span>
                    <span className="font-bold text-sm" style={{ color: isComplete ? '#10b981' : goal.color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isComplete ? '#10b981' : goal.color }}
                    />
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-2 text-xs text-muted mb-4">
                  {!isComplete && (
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {formatCurrency(remaining)} left
                    </span>
                  )}
                  {days !== null && (
                    <span className={`flex items-center gap-1 ${days < 0 ? 'text-danger' : days < 14 ? 'text-orange-500' : ''}`}>
                      <CalendarDays className="w-3 h-3" />
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  )}
                  {months !== null && !isComplete && (
                    <span className="flex items-center gap-1 text-primary">
                      <PiggyBank className="w-3 h-3" />
                      ~{months}mo to complete
                    </span>
                  )}
                </div>

                {!isComplete && (
                  <button
                    onClick={() => { setFundModal(goal); setFundAmount(''); }}
                    className="w-full py-2 text-sm font-medium rounded-xl border transition-all hover:text-white"
                    style={{ borderColor: goal.color, color: goal.color }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = goal.color)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    + Add Funds
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="col-span-full text-center p-16 bg-background border border-secondary rounded-2xl">
            <PiggyBank className="w-14 h-14 text-muted mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground">No goals yet</h3>
            <p className="text-muted mt-1 text-sm">Create your first financial goal to start saving.</p>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-secondary rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">New Goal</h2>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Emoji picker */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted">Choose Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setEmoji(e)}
                        className={`text-2xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'hover:bg-secondary'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted">Color</label>
                  <div className="flex gap-2">
                    {GOAL_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : ''}`}
                        style={{ backgroundColor: c, ringColor: c }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Goal Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. New Laptop" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Target Amount</label>
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="5000" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Already Saved</label>
                    <input type="number" value={savedAmount} onChange={e => setSavedAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="0" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Deadline (optional)</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-muted hover:bg-secondary/50 rounded-xl font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md">
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {fundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-secondary rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{fundModal.emoji}</div>
                <h2 className="text-lg font-bold">Add Funds to {fundModal.name}</h2>
                <p className="text-sm text-muted mt-1">
                  {formatCurrency(fundModal.savedAmount)} / {formatCurrency(fundModal.targetAmount)}
                </p>
              </div>
              <input
                type="number"
                value={fundAmount}
                onChange={e => setFundAmount(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary outline-none mb-4"
                placeholder="Amount to add"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setFundModal(null)}
                  className="flex-1 py-3 text-muted hover:bg-secondary/50 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddFunds}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md">
                  Add Funds
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
