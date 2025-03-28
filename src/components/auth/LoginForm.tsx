'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import inputStyles from '@/styles/input.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-black dark:text-white mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputStyles.inputField}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-black dark:text-white mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputStyles.inputField}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-700 dark:text-blue-300 hover:underline focus:outline-none font-medium"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}
