import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

export default function Transactions() {
  const { transactions, fetchTransactions, addTransaction, deleteTransaction, formatCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction({
      type,
      amount: Number(amount),
      category: type === 'income' ? 'Income' : category,
      description,
      date: new Date()
    });
    setIsOpen(false);
    setAmount('');
    setCategory('');
    setDescription('');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted text-sm mt-1">Manage your income and expenses.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="bg-background border border-secondary rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-muted">
                <th className="p-4 font-medium text-sm">Description</th>
                <th className="p-4 font-medium text-sm">Category</th>
                <th className="p-4 font-medium text-sm">Date</th>
                <th className="p-4 font-medium text-sm text-right">Amount</th>
                <th className="p-4 font-medium text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {transactions.map((t: any) => (
                  <motion.tr 
                    key={t._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="border-b border-secondary hover:bg-secondary/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-sm">{t.description || 'No description'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted" />
                        <span className="text-sm text-muted">{t.category}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className={`p-4 text-right font-semibold ${t.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => deleteTransaction(t._id)}
                        className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-8 text-center text-muted">No transactions found.</div>
          )}
        </div>
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
              <h2 className="text-xl font-bold mb-6">Add Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors border ${type === 'expense' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-transparent border-secondary text-muted'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors border ${type === 'income' ? 'bg-success/10 border-success/30 text-success' : 'bg-transparent border-secondary text-muted'}`}
                  >
                    Income
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                {type === 'expense' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required={type === 'expense'}
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
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="E.g., Monthly salary"
                  />
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-muted hover:bg-secondary/50 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    Save
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
