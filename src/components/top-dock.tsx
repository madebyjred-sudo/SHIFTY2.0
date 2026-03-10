import { Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function TopDock() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className='fixed top-6 right-6 z-50 flex items-center gap-3'>
      <button 
        onClick={toggleTheme}
        className="p-2.5 rounded-full bg-white/60 dark:glass-dark hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm text-[#0e1745]/60 dark:text-white/60 hover:text-[#0e1745] dark:hover:text-white transition-all"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <button className="p-2.5 rounded-full bg-white/60 dark:glass-dark hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm text-[#0e1745]/60 dark:text-white/60 hover:text-[#0e1745] dark:hover:text-white transition-all">
        <Settings className="w-5 h-5" />
      </button>
      <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-white/20 shadow-sm hover:scale-105 transition-transform">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" 
          alt="Profile" 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer" 
        />
      </button>
    </div>
  );
}
