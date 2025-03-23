import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportBudgetToExcel, ExtendedBudget } from '@/utils/excelExport';
import { Budget, Category, Transaction, ForecastData } from '@/types';
import { Budget as SupabaseBudget } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabaseClient';

interface ExcelExportButtonProps {
  budget: Budget;
}

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({ budget }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Fetch categories for this budget
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('budgetId', budget.id)
        .order('name');
        
      if (categoriesError) {
        throw new Error(`Error fetching categories: ${categoriesError.message}`);
      }
      
      // Fetch transactions for this budget
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('budgetId', budget.id)
        .order('date', { ascending: false });
        
      if (transactionsError) {
        throw new Error(`Error fetching transactions: ${transactionsError.message}`);
      }
      
      // Generate forecast data based on transactions and categories
      const forecastData = generateForecastData(budget, categories, transactions);
      
      // Create ExtendedBudget object compatible with the export function
      const extendedBudget: ExtendedBudget = {
        id: budget.id,
        name: budget.name,
        description: budget.description,
        // Map properties correctly between different Budget types
        totalBudget: budget.totalBudget,
        total_amount: budget.totalBudget,
        created_at: budget.createdAt || new Date().toISOString(),
        updated_at: budget.updatedAt || new Date().toISOString(),
        user_id: budget.userId || '',
        startDate: budget.startDate,
        endDate: budget.endDate
      };
      
      // Export to Excel
      await exportBudgetToExcel(extendedBudget, categories, transactions, forecastData);
      
    } catch (error) {
      console.error('Failed to export budget:', error);
      alert('Failed to export budget to Excel. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Helper function to generate forecast data
  const generateForecastData = (budget: Budget, categories: Category[], transactions: Transaction[]): ForecastData[] => {
    // This is a simplified version - adapt it based on your actual forecast calculation logic
    const startDate = budget.startDate ? new Date(budget.startDate) : new Date();
    const months: ForecastData[] = [];
    
    // Create array of month names (e.g., "Jan 2025", "Feb 2025")
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Initialize empty month data
      const monthData: ForecastData = {
        name: monthName,
        month: i,
        total: 0,
        cumulative: 0,
        remaining: budget.totalBudget
      };
      
      // Add empty category values
      categories.forEach(category => {
        monthData[category.name] = 0;
      });
      
      months.push(monthData);
    }
    
    // Process transactions to fill in month data
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthIndex = transactionDate.getMonth() - startDate.getMonth() + 
        (transactionDate.getFullYear() - startDate.getFullYear()) * 12;
      
      // Skip if transaction is outside our forecast window
      if (monthIndex < 0 || monthIndex >= months.length) return;
      
      // Find category
      const category = categories.find(c => c.id === transaction.category_id);
      
      if (category) {
        // Add to category spending
        months[monthIndex][category.name] = (months[monthIndex][category.name] || 0) + transaction.amount;
      }
      
      // Add to total spending for month
      months[monthIndex].total += transaction.amount;
    });
    
    // Calculate cumulative spending and remaining budget
    let cumulativeSpending = 0;
    months.forEach(month => {
      cumulativeSpending += month.total;
      month.cumulative = cumulativeSpending;
      month.remaining = budget.totalBudget - cumulativeSpending;
    });
    
    return months;
  };

  return (
    <motion.button
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
      onClick={handleExport}
      disabled={isExporting}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Download size={18} />
      <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
    </motion.button>
  );
};

export default ExcelExportButton;
