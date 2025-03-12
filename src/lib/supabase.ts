import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
// These should be set in a .env.local file (not committed to version control)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Make sure you have set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
}

// Create a single supabase client for the entire app
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Type definitions for our budget data
export type Budget = {
  id: string;
  name: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Category = {
  id: string;
  budget_id: string;
  name: string;
  color: string;
  budget: number;
  visible: boolean;
};

export type Expense = {
  id: string;
  category_id: string;
  description: string;
  amount: number;
  date: string;
  recurring: 'one-time' | 'monthly';
  budget_id: string;
};
