import { Category, Expense } from '@/lib/supabase';

export interface CategoryWithSpent extends Category {
  spent?: number;
  remaining?: number;
}

export interface ForecastData {
  name: string;
  month: number;
  total: number;
  cumulative?: number;
  remaining?: number;
  [key: string]: any; // Allow dynamic category names as properties
}

export interface BudgetTotals {
  spent: number;
  allocated: number;
  unallocated: number;
  remaining: number;
  percentUsed: string;
}

export type ViewType = 'dashboard' | 'categories' | 'expenses' | 'forecast';

export interface NewCategoryData {
  name: string;
  budget: number;
  color: string;
}

export interface NewExpenseData {
  category_id: string;
  description: string;
  amount: number;
  budgeted_amount?: number; // Optional, if not provided, amount will be used
  date: string;
  recurring: 'one-time' | 'monthly';
  is_actual?: boolean; // Whether this is an actual expense or a planned/budgeted one
}
