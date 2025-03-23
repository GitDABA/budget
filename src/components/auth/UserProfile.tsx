'use client';

import { useAuth } from './AuthContext';
import { useState } from 'react';
import Link from 'next/link';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded="false"
      >
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {user.email?.[0].toUpperCase() || 'U'}
        </div>
        <span className="hidden md:inline">{user.email}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium">{user.email}</p>
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Your Profile
          </Link>
          <button
            onClick={() => {
              signOut();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
