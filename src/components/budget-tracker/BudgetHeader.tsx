import React from 'react';
import { formatCurrency } from './BudgetCalculations';
import { BudgetTotals } from './BudgetTypes';
import { motion } from 'framer-motion';
import { PlusCircle, FilePlus } from 'lucide-react';
import { useState } from 'react';
import { ExcelExportButton } from '../ExcelExportDashboard';

interface BudgetHeaderProps {
  budgetName: string;
  totalBudget: number;
  totals: BudgetTotals;
  budget?: any; // Full budget object for export
  onAddCategory?: () => void;
  onAddExpense?: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ 
  budgetName, 
  totalBudget, 
  totals,
  budget,
  onAddCategory,
  onAddExpense
}) => {
  // Calculate percentage spent
  const percentSpent = totalBudget > 0 ? Math.round((totals.spent / totalBudget) * 100) : 0;
  
  return (
    <div className="bg-white dark:bg-card-dark rounded-lg shadow-md p-6 mb-6 transition-all">
      {/* Top header with title and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
            {budgetName}
          </h2>
          <div className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary mt-1">
            {formatCurrency(totalBudget)}
          </div>
        </div>
        
        {/* Action buttons - always in header */}
        <div className="flex items-center gap-2 self-start">
          {budget && (
            <div className="mr-1">
              <ExcelExportButton 
                budget={{
                  ...budget,
                  totalBudget: totalBudget,
                  // Add any other properties needed for the ExtendedBudget interface
                  startDate: budget.created_at,
                  endDate: budget.end_date || undefined,
                  description: budget.description || ''
                }} 
              />
            </div>
          )}
            
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Legg til utgift"
            >
              <FilePlus size={16} className="mr-1" />
              <span className="hidden md:inline">Ny utgift</span>
              <span className="md:hidden">Utgift</span>
            </button>
          )}
          
          {onAddCategory && (
            <button
              onClick={onAddCategory}
              className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-secondary-600 dark:bg-secondary-700 rounded-lg hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
              aria-label="Legg til kategori"
            >
              <PlusCircle size={16} className="mr-1" />
              <span className="hidden md:inline">Ny kategori</span>
              <span className="md:hidden">Kategori</span>
            </button>
          )}
        </div>
      </div>

      {/* Budget stats section */}
      <div className="flex justify-center sm:justify-start items-center gap-6 text-text-light-secondary dark:text-text-dark-secondary">

        
        <div className="text-center">
          <div className="text-sm font-medium">Brukt</div>
          <div className="font-bold text-lg">{formatCurrency(totals.spent)}</div>
          <div className="text-xs">{percentSpent}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-medium">Gjenværende</div>
          <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.remaining)}</div>
          <div className="text-xs">{100 - percentSpent}%</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary-600 dark:bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentSpent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-text-light-secondary dark:text-text-dark-secondary">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default BudgetHeader;
