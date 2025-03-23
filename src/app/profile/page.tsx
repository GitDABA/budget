'use client';

import { useAuth } from '@/components/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    router.push('/login');
  };

  return (
    <>
      <Navigation />
      <ProtectedRoute>
        <div className="container mx-auto max-w-3xl p-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            
            {user && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user.email}</h2>
                    <p className="text-gray-500 dark:text-gray-400">User ID: {user.id.substring(0, 8)}...</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
                  <h3 className="text-lg font-medium mb-4">Account Information</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}
