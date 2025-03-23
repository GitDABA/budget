'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedContainer } from './ui/animatedContainer';
import { AnimatedPieChart } from './ui/animatedPieChart';
import { TransactionsList, Transaction } from './ui/transactionsList';
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  DollarSign, PiggyBank, Calendar, RefreshCw, 
  ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';

type Category = {
  id: string;
  name: string;
  budget_amount: number;
  spent_amount: number;
  color: string;
};

type BudgetDashboardProps = {
  budgetId: string;
  budgetName: string;
  totalAmount: number;
  remainingAmount: number;
  spentAmount: number;
  categories: Category[];
  transactions?: Transaction[];
  className?: string;
  isLoading?: boolean;
  currencyPrefix?: string;
};

export function BudgetDashboard({
  budgetId,
  budgetName,
  totalAmount,
  remainingAmount,
  spentAmount,
  categories = [],
  transactions = [],
  className = '',
  isLoading = false,
  currencyPrefix = 'NOK '
}: BudgetDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [healthStatus, setHealthStatus] = useState<'good' | 'warning' | 'danger'>('good');
  const [spentPercentage, setSpentPercentage] = useState(0);

  // Calculate budget health status
  useEffect(() => {
    const percentSpent = (spentAmount / totalAmount) * 100;
    setSpentPercentage(percentSpent);
    
    if (percentSpent > 90) {
      setHealthStatus('danger');
    } else if (percentSpent > 75) {
      setHealthStatus('warning');
    } else {
      setHealthStatus('good');
    }
  }, [spentAmount, totalAmount]);

  // Filter transactions by selected category
  useEffect(() => {
    if (selectedCategory) {
      setFilteredTransactions(
        transactions.filter(transaction => transaction.category === selectedCategory)
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [selectedCategory, transactions]);

  // Format data for pie chart
  const categoryData = categories.map(category => ({
    name: category.name,
    value: category.spent_amount,
    color: category.color,
  }));

  // Format data for bar chart - sort by spent amount
  const categorySortedData = [...categories]
    .sort((a, b) => b.spent_amount - a.spent_amount)
    .slice(0, 8) // Show top 8 categories
    .map(category => ({
      name: category.name,
      value: category.spent_amount,
      color: category.color,
    }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${currencyPrefix}${amount.toLocaleString()}`;
  };

  // Filter transactions based on category click
  const handleCategoryClick = (item: any) => {
    const categoryName = item.name;
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  // Get recent transactions, sorted by date
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate spending trends (simplified example)
  const getSpendingTrend = () => {
    if (transactions.length === 0) return 0;
    
    // In a real app, you would calculate this based on historical data
    const trend = spentPercentage > 75 ? -5 : 8;
    return trend;
  };

  const trend = getSpendingTrend();

  return (
    <div className={`${className}`}>
      {/* Header */}
      <AnimatedContainer delay={0.1}>
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-radial from-primary-500/10 to-transparent opacity-60"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between">
            <div>
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {budgetName}
              </motion.h1>
              <p className="text-gray-500 dark:text-white mt-1 mb-4">
                Budget overview and spending analysis
              </p>
              
              <div className="flex items-center mt-1 text-sm">
                <Calendar className="mr-2 text-gray-400" size={14} />
                <span className="text-gray-500 dark:text-white">
                  {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
                
                {healthStatus === 'good' && (
                  <span className="ml-3 text-green-500 flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    Healthy budget
                  </span>
                )}
                
                {healthStatus === 'warning' && (
                  <span className="ml-3 text-amber-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    Watch spending
                  </span>
                )}
                
                {healthStatus === 'danger' && (
                  <span className="ml-3 text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    Budget at risk
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <motion.button
                className="btn btn-outline btn-sm flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw size={14} className="mr-1" />
                Refresh Data
              </motion.button>
            </div>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AnimatedContainer delay={0.15} variant="slideUp">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/20 to-transparent dark:from-green-900/5 dark:to-transparent"></div>
            <div className="flex justify-between">
              <div className="relative">
                <p className="text-sm font-medium text-gray-500 dark:text-white">
                  Total Budget
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {formatCurrency(totalAmount)}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 flex items-center text-xs font-medium">
                    <PiggyBank size={14} className="mr-1" />
                    Available
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-success-900/30 flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
          </div>
        </AnimatedContainer>
        
        <AnimatedContainer delay={0.2} variant="slideUp">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/20 to-transparent dark:from-amber-900/5 dark:to-transparent"></div>
            <div className="flex justify-between">
              <div className="relative">
                <p className="text-sm font-medium text-gray-500 dark:text-white">
                  Spent
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {formatCurrency(spentAmount)}
                </h3>
                <div className="flex items-center mt-2">
                  <span className={`flex items-center text-xs font-medium ${
                    trend > 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {trend > 0 ? (
                      <ArrowUpRight size={14} className="mr-1" />
                    ) : (
                      <ArrowDownRight size={14} className="mr-1" />
                    )}
                    {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-warning-900/30 flex items-center justify-center">
                <ArrowUpRight className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
            </div>
          </div>
        </AnimatedContainer>
        
        <AnimatedContainer delay={0.25} variant="slideUp">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-transparent dark:from-blue-900/5 dark:to-transparent"></div>
            <div className="flex justify-between">
              <div className="relative">
                <p className="text-sm font-medium text-gray-500 dark:text-white">
                  Remaining
                </p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {formatCurrency(remainingAmount)}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-blue-500 flex items-center text-xs font-medium">
                    <TrendingUp size={14} className="mr-1" />
                    {Math.round((remainingAmount / totalAmount) * 100)}% of budget
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-primary-900/30 flex items-center justify-center">
                <PiggyBank className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
      
      {/* Budget progress */}
      <AnimatedContainer delay={0.3} variant="fadeIn" className="mb-6">
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-5 relative overflow-hidden">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Budget Progress</h3>
            <span className="text-sm text-gray-500 dark:text-white">
              {spentPercentage.toFixed(1)}% used
            </span>
          </div>
          
          <div className="w-full h-4 bg-concrete dark:bg-[#222222] rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                healthStatus === 'good' 
                  ? 'bg-green-500' 
                  : healthStatus === 'warning' 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${spentPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-white">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie chart */}
        <AnimatedContainer delay={0.35} variant="fadeIn">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Spending by Category
            </h3>
            <AnimatedPieChart 
              data={categoryData} 
              height={300}
              valuePrefix={currencyPrefix}
              valueFormatter={formatCurrency}
              onSliceClick={handleCategoryClick}
              emptyMessage="No spending data available yet"
              legendPosition="bottom"
            />
          </div>
        </AnimatedContainer>
        
        {/* Bar chart */}
        <AnimatedContainer delay={0.4} variant="fadeIn">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Top Spending Categories
            </h3>
            <AnimatedPieChart 
              data={categorySortedData}
              height={300}
              valuePrefix={currencyPrefix}
              valueFormatter={formatCurrency}
              onSliceClick={handleCategoryClick}
              emptyMessage="No spending data available yet"
            />
          </div>
        </AnimatedContainer>
      </div>
      
      {/* Recent transactions */}
      <AnimatedContainer delay={0.45} variant="fadeIn" className="mb-6">
        <TransactionsList 
          transactions={recentTransactions}
          title={selectedCategory ? `Transactions: ${selectedCategory}` : "Recent Transactions"}
          emptyMessage={selectedCategory ? `No transactions found for ${selectedCategory}` : "No recent transactions"}
          showFilters={!selectedCategory}
          maxItems={5}
          showLoadMore={filteredTransactions.length > 5}
          onLoadMore={() => {}}
          isLoading={isLoading}
          currencyPrefix={currencyPrefix}
        />
        
        {selectedCategory && (
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            >
              View all transactions <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </AnimatedContainer>
    </div>
  );
}

export default BudgetDashboard;
