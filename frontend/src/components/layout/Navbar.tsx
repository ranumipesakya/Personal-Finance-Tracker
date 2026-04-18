import { Moon, Sun, Bell } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Navbar() {
  const { user, toggleTheme, theme, currency, toggleCurrency } = useStore();

  return (
    <header className="h-16 border-b border-secondary bg-background/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex-1">
        {/* Can add search here later */}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleCurrency}
          className="px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-sm font-semibold transition-colors flex items-center gap-1"
        >
          {currency === 'USD' ? '🇺🇸 USD' : '🇱🇰 LKR'}
        </button>

        <button className="p-2 rounded-full hover:bg-secondary text-muted transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        
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
