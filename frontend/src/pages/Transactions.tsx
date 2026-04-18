import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Tag, Edit2, Filter, X, Search } from 'lucide-react';
import { TransactionSkeleton } from '../components/Skeleton';

export default function Transactions() {
  const { transactions, fetchTransactions, addTransaction, updateTransaction, deleteTransaction, formatCurrency, isLoading } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Filters state
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type,
      amount: Number(amount),
      category: type === 'income' ? 'Income' : category,
      description,
      date: new Date(date)
    };

    if (isEdit && selectedId) {
      await updateTransaction(selectedId, data);
    } else {
      await addTransaction(data);
    }
    
    closeModal();
  };

  const openEditModal = (t: any) => {
    setIsEdit(true);
    setSelectedId(t._id);
    setType(t.type);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setDescription(t.description);
    setDate(new Date(t.date).toISOString().split('T')[0]);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEdit(false);
    setSelectedId(null);
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const filteredTransactions = transactions.filter((t: any) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(transactions.map((t: any) => t.category))).filter(c => c !== 'Income');

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted text-sm mt-1">Manage your income and expenses.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-background border border-secondary rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary/20 border border-secondary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-muted shrink-0" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-secondary/20 border border-secondary rounded-xl px-3 py-2 text-sm outline-none w-full"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-secondary/20 border border-secondary rounded-xl px-3 py-2 text-sm outline-none w-full"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-background border border-secondary rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading && transactions.length === 0 ? (
            <div className="p-4">
              <TransactionSkeleton />
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 text-muted">
                    <th className="p-4 font-medium text-sm">Description</th>
                    <th className="p-4 font-medium text-sm">Category</th>
                    <th className="p-4 font-medium text-sm">Date</th>
                    <th className="p-4 font-medium text-sm text-right">Amount</th>
                    <th className="p-4 font-medium text-sm text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((t: any) => (
                      <motion.tr 
                        key={t._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border-b border-secondary hover:bg-secondary/10 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                              {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-sm truncate max-w-[200px]">{t.description || 'No description'}</span>
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
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => openEditModal(t)}
                              className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteTransaction(t._id)}
                              className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {(filteredTransactions.length === 0 && !isLoading) && (
                <div className="p-12 text-center text-muted">
                  <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 opacity-30" />
                  </div>
                  <p>No transactions found matching your filters.</p>
                </div>
              )}
            </>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-secondary text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary/30 border border-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
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
                    placeholder="E.g., Groceries"
                  />
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 text-muted hover:bg-secondary/50 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    {isEdit ? 'Update' : 'Save'}
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
