import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { useTheme } from '@/contexts/ThemeContext';

// Import view components from the budget-tracker directory
import BudgetTracker from './budget-tracker/BudgetTracker';
import DashboardView from './budget-tracker/DashboardView';
import CategoriesView from './budget-tracker/CategoriesView';
import ExpensesView from './budget-tracker/ExpensesView';
import ForecastView from './budget-tracker/ForecastView';
import SetupModal from './budget-tracker/SetupModal';

// Import types and utility functions
import { CategoryWithSpent, ForecastData, ViewType, NewCategoryData, NewExpenseData } from './budget-tracker/BudgetTypes';
import { calculateSpentPerCategory, calculateTotals, formatCurrency } from './budget-tracker/BudgetCalculations';
import { Expense } from '@/lib/supabase';

// Define months for use in the app (in Norwegian)
const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

const FixedBudgetTracker: React.FC = () => {
  // Use the BudgetTracker component directly
  return (
    <BudgetTracker />
  );
};

export default FixedBudgetTracker;
