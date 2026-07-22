import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '1px solid var(--panel-border)', background: 'rgba(255, 255, 255, 0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'var(--transition-smooth)',
        color: theme === 'dark' ? '#fbbf24' : '#6366f1',
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'var(--panel-border-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'var(--panel-border)'; }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
