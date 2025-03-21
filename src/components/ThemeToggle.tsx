'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-input-light dark:bg-input-dark hover:bg-concrete dark:hover:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors shadow-button-light dark:shadow-button-dark"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-text-light-primary dark:text-text-dark-primary" />
      ) : (
        <Sun size={20} className="text-amber-400 dark:text-amber-300" />
      )}
    </button>
  );
}
