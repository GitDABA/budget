"use client";

import dynamic from 'next/dynamic';
import { BudgetProvider } from '@/contexts/BudgetContext';
import BudgetSelector from '@/components/BudgetSelector';

// Dynamically import the fixed BudgetTracker component with SSR disabled
// This prevents hydration errors since the component uses browser APIs
const BudgetTracker = dynamic(
  () => import('@/components/FixedBudgetTracker'),
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
        <header className="mb-8 bg-regal-blue rounded-xl shadow-lg p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Budget Tracker App
          </h1>
          <p className="text-center text-blue-100 max-w-xl mx-auto">Manage and track your budgets effectively with our intuitive dashboard</p>
        </header>
        
        <AppContents BudgetTrackerComponent={BudgetTracker} />
      </div>
    </BudgetProvider>
  );
}
