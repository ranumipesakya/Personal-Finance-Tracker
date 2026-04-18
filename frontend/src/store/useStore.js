import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  transactions: [],
  budgets: [],
  insights: [],
  isLoading: false,
  error: null,
  theme: localStorage.getItem('theme') || 'light',
  currency: localStorage.getItem('currency') || 'USD',

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    set({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  toggleCurrency: () => {
    const newCurrency = get().currency === 'USD' ? 'LKR' : 'USD';
    localStorage.setItem('currency', newCurrency);
    set({ currency: newCurrency });
  },

  formatCurrency: (amount) => {
    const { currency } = get();
    if (currency === 'LKR') {
      return `Rs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  initTheme: () => {
    if (get().theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  },

  // Auth Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${res.data.name}!`);
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, transactions: [], budgets: [], insights: [] });
    toast.success('Signed out');
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ isAuthenticated: false });
    }
  },

  // Transactions Actions
  fetchTransactions: async () => {
    try {
      const res = await api.get('/transactions');
      set({ transactions: res.data });
    } catch (error) {
      set({ error: 'Failed to fetch transactions' });
    }
  },

  addTransaction: async (data) => {
    try {
      const res = await api.post('/transactions', data);
      set((state) => ({ transactions: [res.data, ...state.transactions] }));
      toast.success('Transaction saved');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  },

  deleteTransaction: async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({ transactions: state.transactions.filter(t => t._id !== id) }));
      toast.success('Transaction deleted');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  },

  // Budgets Actions
  fetchBudgets: async () => {
    try {
      const res = await api.get('/budgets');
      set({ budgets: res.data });
    } catch (error) {
      set({ error: 'Failed to fetch budgets' });
    }
  },

  addBudget: async (data) => {
    try {
      await api.post('/budgets', data);
      get().fetchBudgets(); // refresh budgets
    } catch (error) {
      set({ error: 'Failed to add budget' });
    }
  },

  // Insights Actions
  fetchInsights: async () => {
    try {
      const res = await api.get('/insights');
      set({ insights: res.data });
    } catch (error) {
      set({ error: 'Failed to fetch insights' });
    }
  },

  // Budget Alerts
  getBudgetAlerts: () => {
    const { budgets, transactions } = get();

    const getPeriodStart = (period) => {
      const now = new Date();
      switch (period) {
        case 'daily':
          return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        case 'weekly': {
          const diff = now.getDate() - now.getDay();
          return new Date(now.getFullYear(), now.getMonth(), diff);
        }
        case 'annually':
          return new Date(now.getFullYear(), 0, 1);
        case 'monthly':
        default:
          return new Date(now.getFullYear(), now.getMonth(), 1);
      }
    };

    return budgets.map((budget) => {
      const period = budget.period || 'monthly';
      const periodStart = getPeriodStart(period);
      const spent = transactions
        .filter((t) =>
          t.type === 'expense' &&
          t.category === budget.category &&
          new Date(t.date) >= periodStart
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.limit) * 100;
      let level = null;
      if (percentage >= 100) level = 'danger';
      else if (percentage >= 80) level = 'warning';

      return level ? { budget, spent, percentage, level, period } : null;
    }).filter(Boolean);
  },
}));
