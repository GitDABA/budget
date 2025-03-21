import { Category, Expense } from '@/lib/supabase';
import { CategoryWithSpent, ForecastData } from '@/components/budget-tracker/BudgetTypes';

// Re-export types from other files
export type { Category, Expense };
export type { CategoryWithSpent, ForecastData };

// Basic budget shape for exporting
export interface Budget {
  id: string;
  name: string;
  description?: string;
  totalBudget: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

// Transaction is equivalent to Expense but with a more generic name
export type Transaction = Expense;
