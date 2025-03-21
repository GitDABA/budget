import React from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { useTheme } from '@/contexts/ThemeContext';

const BudgetTrackerSimplified: React.FC = () => {
  // Get budget context
  const { selectedBudget } = useBudget();
  // Get theme context
  const { theme } = useTheme();

  return (
    <div className="h-full">
      {!selectedBudget ? (
        <div>Loading...</div>
      ) : (
        <div>Budget content would go here</div>
      )}
    </div>
  );
};

export default BudgetTrackerSimplified;
