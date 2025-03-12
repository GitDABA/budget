'use client';

import React from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import BudgetSelector from './BudgetSelector';
import { ComponentType } from 'react';

interface AppContentsProps {
  BudgetTrackerComponent: ComponentType;
}

export default function AppContents({ BudgetTrackerComponent }: AppContentsProps) {
  const { selectedBudget, budgets } = useBudget();
  
  return (
    <>
      <BudgetSelector />
      
      {/* Only render the BudgetTracker when a budget is selected */}
      {selectedBudget && budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <BudgetTrackerComponent />
        </div>
      )}
    </>
  );
}
