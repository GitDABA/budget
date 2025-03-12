"use client";

import dynamic from 'next/dynamic';
import { BudgetProvider } from '@/contexts/BudgetContext';
import BudgetSelector from '@/components/BudgetSelector';

// Dynamically import the BudgetTracker component with SSR disabled
// This prevents hydration errors since the component uses browser APIs
const BudgetTracker = dynamic(
  () => import('@/components/BudgetTracker'),
  { ssr: false }
);

// Dynamic import for the app contents to properly handle context
const AppContents = dynamic(
  () => import('@/components/AppContents'),
  { ssr: false }
);

export default function Home() {
  return (
    <BudgetProvider>
      <div className="container mx-auto max-w-7xl min-h-screen p-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Budget Tracker App</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">Manage and track your budgets effectively</p>
        </header>
        
        <AppContents BudgetTrackerComponent={BudgetTracker} />
      </div>
    </BudgetProvider>
  );
}
