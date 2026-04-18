import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { transactions, fetchTransactions, user, formatCurrency } = useStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Prepare data for chart (Last 6 transactions for simplicity here, grouping by date is better)
  const chartData = [...transactions].reverse().map(t => ({
    name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));

  const statCards = [
    { title: 'Total Balance', amount: balance, icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Total Income', amount: totalIncome, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Total Expense', amount: totalExpense, icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

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
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(Math.abs(stat.amount))}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-background border border-secondary rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-lg mb-6">Cash Flow</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--secondary)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-lg mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t: any) => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{t.description || t.category}</h4>
                    <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-semibold ${t.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No transactions yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
