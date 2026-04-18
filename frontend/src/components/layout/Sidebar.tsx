import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, LineChart, Target, BrainCircuit, User, LogOut, PiggyBank } from 'lucide-react';
import { useStore } from '../../store/useStore';

const navItems = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { name: 'Transactions', path: '/app/transactions', icon: Receipt },
  { name: 'Analytics', path: '/app/analytics', icon: LineChart },
  { name: 'Budget', path: '/app/budget', icon: Target },
  { name: 'Goals', path: '/app/goals', icon: PiggyBank },
  { name: 'AI Insights', path: '/app/insights', icon: BrainCircuit },
  { name: 'Profile', path: '/app/profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useStore();

  return (
    <div className="w-64 bg-background border-r border-secondary h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-4 mb-8">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <span className="font-bold text-xl tracking-tight">Pocket Honey</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                  isActive ? 'text-primary font-medium' : 'text-muted hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-secondary">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
