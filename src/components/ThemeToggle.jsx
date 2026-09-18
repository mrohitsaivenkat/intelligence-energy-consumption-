import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ 
  compact = false, 
  showLabel = false, 
  className = '',
  id = 'theme-toggle-btn'
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        id={id}
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`p-2 rounded-xl transition-all duration-300 border flex items-center justify-center relative group focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
          isDark
            ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/50 shadow-sm'
            : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-sm'
        } ${className}`}
      >
        <span className="sr-only">Toggle theme</span>
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 text-indigo-600" />
        )}
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-amber-400/40'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      <div className={`p-1 rounded-lg transition-colors duration-300 ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-indigo-50 text-indigo-600'}`}>
        {isDark ? (
          <Sun className="w-3.5 h-3.5 animate-spin-slow" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </div>
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default ThemeToggle;
