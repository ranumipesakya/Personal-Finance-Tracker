import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Bell, AlertTriangle, XCircle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const PERIOD_LABELS: Record<string, string> = {
  daily: 'today',
  weekly: 'this week',
  monthly: 'this month',
  annually: 'this year',
};

export default function Navbar() {
  const { user, toggleTheme, theme, currency, toggleCurrency, getBudgetAlerts, formatCurrency } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allAlerts = getBudgetAlerts();
  const alerts = allAlerts.filter((a: any) => !dismissed.has(a.budget._id + a.level));
  // Badge count = alerts the user hasn't opened the panel to see yet
  const unreadCount = alerts.filter((a: any) => !seenIds.has(a.budget._id + a.level)).length;

  const dismiss = (id: string, level: string) => {
    setDismissed(prev => new Set(prev).add(id + level));
  };

  const clearAll = () => {
    const newSet = new Set(dismissed);
    allAlerts.forEach((a: any) => newSet.add(a.budget._id + a.level));
    setDismissed(newSet);
  };

  return (
    <header className="h-16 border-b border-secondary bg-background/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex-1">
        {/* Can add search here later */}
      </div>

      <div className="flex items-center gap-4">
        {/* Currency toggle */}
        <button
          onClick={toggleCurrency}
          className="px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-sm font-semibold transition-colors flex items-center gap-1"
        >
          {currency === 'USD' ? '🇺🇸 USD' : '🇱🇰 LKR'}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              const opening = !notifOpen;
              setNotifOpen(opening);
              if (opening) {
                // Mark all current alerts as seen when panel opens
                setSeenIds(prev => {
                  const next = new Set(prev);
                  alerts.forEach((a: any) => next.add(a.budget._id + a.level));
                  return next;
                });
              }
            }}
            className="p-2 rounded-full hover:bg-secondary text-muted transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-background border border-secondary rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-secondary">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-1 rounded-lg hover:bg-secondary text-muted transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Alert list */}
                <div className="max-h-80 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
                      <Bell className="w-8 h-8 opacity-30" />
                      <p className="text-sm">All budgets are on track!</p>
                    </div>
                  ) : (
                    alerts.map((alert: any) => {
                      const isDanger = alert.level === 'danger';
                      return (
                        <div
                          key={alert.budget._id + alert.level}
                          className={`flex items-start gap-3 px-4 py-3.5 border-b border-secondary/50 last:border-0 ${
                            isDanger ? 'bg-danger/5' : 'bg-orange-500/5'
                          }`}
                        >
                          <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isDanger ? 'bg-danger/10 text-danger' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {isDanger
                              ? <XCircle className="w-4 h-4" />
                              : <AlertTriangle className="w-4 h-4" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {isDanger ? '🚨 Budget Exceeded' : '⚠️ Budget Warning'}
                            </p>
                            <p className="text-xs text-muted mt-0.5 leading-relaxed">
                              <span className="font-medium text-foreground">{alert.budget.category}</span>
                              {' '}— spent{' '}
                              <span className={`font-medium ${isDanger ? 'text-danger' : 'text-orange-500'}`}>
                                {formatCurrency(alert.spent)}
                              </span>
                              {' '}of{' '}
                              <span className="font-medium">{formatCurrency(alert.budget.limit)}</span>
                              {' '}{PERIOD_LABELS[alert.period] || 'this period'}
                              {' '}({alert.percentage.toFixed(0)}%)
                            </p>
                          </div>
                          <button
                            onClick={() => dismiss(alert.budget._id, alert.level)}
                            className="ml-1 p-1 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {alerts.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-secondary bg-secondary/10">
                    <p className="text-xs text-muted text-center">
                      {unreadCount} active budget alert{unreadCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-secondary text-muted transition-colors"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="h-8 w-[1px] bg-secondary mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none">{user?.name || 'User'}</span>
            <span className="text-xs text-muted mt-1">{user?.email || ''}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-medium shadow-md">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
