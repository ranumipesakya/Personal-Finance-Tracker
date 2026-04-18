import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Target, PiggyBank } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

function HealthScore({ score }: { score: number }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Fair' : 'Needs Work';
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="38" fill="none" stroke="var(--secondary)" strokeWidth="8" />
          <motion.circle
            cx="44" cy="44" r="38" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
          <span className="text-[10px] text-muted">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm" style={{ color }}>{label}</p>
        <p className="text-xs text-muted">Financial Health</p>
      </div>
    </div>
  );
}

function computeHealthScore(transactions: any[], budgets: any[]) {
  if (transactions.length === 0) return 50;
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  let score = 50;
  // Savings rate (0-30 pts)
  if (income > 0) {
    const savingsRate = (income - expense) / income;
    score += Math.min(savingsRate * 30, 30);
  }
  // Budget adherence (0-20 pts)
  if (budgets.length > 0) {
    const month = new Date().toISOString().slice(0, 7);
    const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date?.slice(0, 7) === month);
    const byCategory: Record<string, number> = {};
    monthExpenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
    const monthBudgets = budgets.filter(b => b.month === month);
    if (monthBudgets.length > 0) {
      const onTrack = monthBudgets.filter(b => (byCategory[b.category] || 0) <= b.limit).length;
      score += (onTrack / monthBudgets.length) * 20;
    }
  }
  // Positive balance bonus (0 or +10 pts)
  if (income > expense) score = Math.min(score + 10, 100);
  return Math.max(0, Math.min(Math.round(score), 100));
}

export default function Dashboard() {
  const { transactions, fetchTransactions, fetchBudgets, fetchGoals, budgets, goals, user, formatCurrency } = useStore();

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
    fetchGoals();
  }, [fetchTransactions, fetchBudgets, fetchGoals]);

  const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const healthScore = computeHealthScore(transactions, budgets);
  const activeGoals = (goals as any[]).filter(g => g.savedAmount < g.targetAmount).length;

  const chartData = [...transactions].reverse().slice(-12).map((t: any) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));

  const statCards = [
    { title: 'Total Balance', amount: balance, icon: Wallet, color: 'text-primary', bg: 'bg-primary/10', prefix: balance < 0 ? '-' : '' },
    { title: 'Total Income', amount: totalIncome, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', prefix: '+' },
    { title: 'Total Expense', amount: totalExpense, icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10', prefix: '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back, {user?.name} 👋</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted">{stat.title}</h3>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${stat.title === 'Total Expense' ? 'text-danger' : stat.title === 'Total Income' ? 'text-success' : balance < 0 ? 'text-danger' : 'text-foreground'}`}>
              {formatCurrency(Math.abs(stat.amount))}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts + Health + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-background border border-secondary rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-lg mb-6">Cash Flow</h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--secondary)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-background border border-secondary rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <h3 className="font-bold text-lg mb-2">Health Score</h3>
          <div className="flex-1 flex items-center justify-center">
            <HealthScore score={healthScore} />
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-muted">
            <div className="flex justify-between"><span>Savings Rate</span><span className="text-foreground font-medium">{totalIncome > 0 ? `${Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%` : 'N/A'}</span></div>
            <div className="flex justify-between"><span>Active Goals</span><span className="text-foreground font-medium">{activeGoals}</span></div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions + Goals preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Transactions</h3>
            <Link to="/app/transactions" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(transactions as any[]).slice(0, 5).map((t) => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{t.description || t.category}</h4>
                    <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${t.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-sm text-muted text-center py-4">No transactions yet</p>}
          </div>
        </motion.div>

        {/* Goals preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Goals Progress</h3>
            <Link to="/app/goals" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {(goals as any[]).slice(0, 4).map(goal => {
              const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <span>{goal.emoji}</span>{goal.name}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="text-center py-6 text-muted">
                <PiggyBank className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No goals set yet</p>
                <Link to="/app/goals" className="text-xs text-primary hover:underline mt-1 block">Create your first goal →</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
