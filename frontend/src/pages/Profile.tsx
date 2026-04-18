import { useStore } from '../store/useStore';
import { User, Mail, Settings, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, theme, toggleTheme, logout } = useStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-secondary rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-8 flex items-center gap-6 border-b border-secondary">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-4xl text-white font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <div className="flex items-center gap-2 text-muted mt-1">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <div className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              Plus Member
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Preferences
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-orange-500" />}
                <div>
                  <h4 className="font-medium">Appearance</h4>
                  <p className="text-xs text-muted">Toggle dark/light mode</p>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className="w-14 h-7 rounded-full bg-secondary relative transition-colors shadow-inner"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7 bg-primary' : ''}`} />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-secondary">
            <button 
              onClick={logout}
              className="w-full py-3 bg-danger/10 text-danger font-medium rounded-xl hover:bg-danger hover:text-white transition-all shadow-sm"
            >
              Sign out from all devices
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
