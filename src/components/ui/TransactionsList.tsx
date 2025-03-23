'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Tag, Calendar, Search, Filter, X, ChevronRight } from 'lucide-react';
import { AnimatedContainer } from './animatedcontainer';

// Types
export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  categoryColor?: string;
};

type TransactionsListProps = {
  transactions: Transaction[];
  title?: string;
  emptyMessage?: string;
  className?: string;
  onTransactionClick?: (transaction: Transaction) => void;
  showFilters?: boolean;
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  currencyPrefix?: string;
};

export function TransactionsList({
  transactions = [],
  title = 'Recent Transactions',
  emptyMessage = 'No transactions found',
  className = '',
  onTransactionClick,
  showFilters = true,
  maxItems = 5,
  showLoadMore = false,
  onLoadMore,
  isLoading = false,
  currencyPrefix = 'NOK ',
}: TransactionsListProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Apply filters when transactions, searchTerm, or filter changes
  useEffect(() => {
    let results = transactions;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        transaction => 
          transaction.description.toLowerCase().includes(term) ||
          transaction.category.toLowerCase().includes(term)
      );
    }
    
    // Filter by type
    if (filter !== 'all') {
      results = results.filter(transaction => transaction.type === filter);
    }
    
    setFilteredTransactions(results);
  }, [transactions, searchTerm, filter]);

  // Animate in transactions one by one
  useEffect(() => {
    setVisibleTransactions([]);
    
    const toShow = filteredTransactions.slice(0, maxItems);
    
    toShow.forEach((transaction, index) => {
      setTimeout(() => {
        setVisibleTransactions(prev => [...prev, transaction]);
      }, 50 * index);
    });
  }, [filteredTransactions, maxItems]);

  const handleFilterClick = (newFilter: 'all' | 'income' | 'expense') => {
    setFilter(prevFilter => prevFilter === newFilter ? 'all' : newFilter);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <AnimatedContainer className={`w-full ${className}`} variant="fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/10 to-transparent dark:from-primary-900/5 dark:to-transparent opacity-50"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
            <motion.h3 
              className="text-lg font-bold text-gray-800 dark:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h3>

            {/* Filters */}
            {showFilters && (
              <motion.div 
                className="flex flex-wrap sm:flex-nowrap items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {/* Search */}
                <div className={`relative ${isSearchFocused ? 'flex-grow' : ''}`}>
                  <input
                    type="text"
                    className="form-input w-full pl-9 py-1.5 text-sm focus:ring-primary-400/30"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    aria-label="Search transactions"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searchTerm && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={clearSearch}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1">
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      filter === 'all' 
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleFilterClick('all')}
                    aria-label="Show all transactions"
                  >
                    <Filter size={14} className="inline mr-1" /> All
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      filter === 'income' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleFilterClick('income')}
                    aria-label="Show income transactions"
                  >
                    <ArrowDown size={14} className="inline mr-1" /> Income
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      filter === 'expense' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleFilterClick('expense')}
                    aria-label="Show expense transactions"
                  >
                    <ArrowUp size={14} className="inline mr-1" /> Expenses
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            <AnimatePresence>
              {isLoading ? (
                // Loading state
                [...Array(3)].map((_, index) => (
                  <motion.div 
                    key={`skeleton-${index}`}
                    className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </motion.div>
                ))
              ) : visibleTransactions.length === 0 ? (
                // Empty state
                <motion.div 
                  className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-500 dark:text-white">{emptyMessage}</p>
                </motion.div>
              ) : (
                // Transactions
                visibleTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    className={`bg-gray-50 dark:bg-gray-800/90 rounded-lg p-3 transition-colors border border-transparent ${
                      onTransactionClick ? 'hover:border-primary-100 dark:hover:border-primary-900/50 cursor-pointer' : ''
                    }`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => onTransactionClick && onTransactionClick(transaction)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <ArrowDown size={16} />
                          ) : (
                            <ArrowUp size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{transaction.description}</p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-white mt-0.5 gap-3">
                            <span className="flex items-center">
                              <Tag size={12} className="mr-1" />
                              <span
                                className="inline-block w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: transaction.categoryColor || '#A3A3A3' }}
                              ></span>
                              {transaction.category}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {currencyPrefix}
                        {Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Load more button */}
            {showLoadMore && filteredTransactions.length > maxItems && (
              <motion.div
                className="text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={onLoadMore}
                  className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 flex items-center justify-center mx-auto"
                >
                  Show More <ChevronRight size={16} className="ml-1" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default TransactionsList;
