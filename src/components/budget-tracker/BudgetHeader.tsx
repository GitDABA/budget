import React from 'react';
import { formatCurrency } from './BudgetCalculations';
import { BudgetTotals } from './BudgetTypes';
import { motion } from 'framer-motion';

interface BudgetHeaderProps {
  budgetName: string;
  totalBudget: number;
  totals: BudgetTotals;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ budgetName, totalBudget, totals }) => {
  // Calculate percentage spent
  const percentSpent = totalBudget > 0 ? Math.round((totals.spent / totalBudget) * 100) : 0;
  
  return (
    <div className="bg-white dark:bg-card-dark rounded-lg shadow-md p-6 mb-6 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
            {budgetName}
          </h2>
          <div className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary mt-1">
            {formatCurrency(totalBudget)}
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-text-light-secondary dark:text-text-dark-secondary">
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
