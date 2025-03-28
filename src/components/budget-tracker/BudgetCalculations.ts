import { CategoryWithSpent, BudgetTotals } from './BudgetTypes';
import { Expense } from '@/lib/supabase';

// Current month and year
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

// Format currency in NOK
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format currency with dynamic abbreviation based on available space
export const formatCurrencyCompact = (amount: number, useSuffix: boolean = true): string => {
  if (Math.abs(amount) >= 1000000) {
    return `${Math.round(amount / 100000) / 10}${useSuffix ? ' mill' : ''}`;
  } else if (Math.abs(amount) >= 10000) {
    return `${Math.round(amount / 1000)}${useSuffix ? ' k' : ''}`;
  } else {
    return `${amount}${useSuffix ? '' : ''}`;
  }
};

// Calculate total budget allocated to categories
export const calculateTotalAllocated = (categories: CategoryWithSpent[]): number => {
  return categories.reduce((sum, category) => {
    const budget = typeof category.budget === 'string' ? parseFloat(category.budget) : category.budget;
    return sum + budget;
  }, 0);
};

// Calculate unallocated budget
export const calculateUnallocatedBudget = (totalBudget: number, categories: CategoryWithSpent[]): number => {
  const allocated = calculateTotalAllocated(categories);
  return totalBudget - allocated;
};

// Calculate spent amount per category
export const calculateSpentPerCategory = (categories: CategoryWithSpent[], expenses: Expense[]): CategoryWithSpent[] => {
  return categories.map(category => {
    const spent = expenses
      .filter(expense => expense.category_id === category.id)
      .reduce((sum, expense) => {
        // Calculate actual spent based on recurring type
        let actualSpent = expense.amount;
        if (expense.recurring === 'monthly') {
          // Count months from expense date to current date
          const expenseDate = new Date(expense.date);
          const expenseMonth = expenseDate.getMonth();
          const expenseYear = expenseDate.getFullYear();
          
          // Calculate months between expense date and now
          const monthDiff = (currentYear - expenseYear) * 12 + (currentMonth - expenseMonth);
          
          // If expense is in the future, count it once for forecasting
          const multiplier = monthDiff < 0 ? 1 : monthDiff + 1;
          actualSpent = expense.amount * multiplier;
        }
        return sum + actualSpent;
      }, 0);
    
    return {
      ...category,
      spent: spent,
      remaining: category.budget - spent
    };
  });
};

// Calculate budget totals
export const calculateTotals = (totalBudget: number, categories: CategoryWithSpent[]): BudgetTotals => {
  // Calculate total spent across all categories
  const totalSpent = categories.reduce((sum, category) => sum + (category.spent || 0), 0);
  
  // Calculate total allocated to categories
  const totalAllocated = categories.reduce((sum, category) => {
    const budget = typeof category.budget === 'string' ? parseFloat(category.budget) : category.budget;
    return sum + budget;
  }, 0);
  
  // Calculate remaining from the TOTAL budget (not just allocated)
  const remaining = totalBudget - totalSpent;
  
  // Calculate percentage based on total budget
  const percentUsed = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0';
  
  return {
    spent: totalSpent,
    allocated: totalAllocated,
    unallocated: totalBudget - totalAllocated,
    remaining: remaining,
    percentUsed: percentUsed
  };
};
