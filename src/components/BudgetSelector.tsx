'use client';

import React, { useState, useEffect } from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { PlusCircle, Trash2, Edit, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer } from './ui/AnimatedContainer';

export default function BudgetSelector() {
  const { 
    budgets, 
    selectedBudget, 
    isLoading, 
    error, 
    createBudget, 
    selectBudget,
    deleteBudget,
    testSupabase 
  } = useBudget();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState(10000);
  const [useTemplate, setUseTemplate] = useState(true);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim() || newBudgetAmount <= 0) return;
    
    await createBudget(newBudgetName, newBudgetAmount, useTemplate);
    setShowCreateModal(false);
    setNewBudgetName('');
    setNewBudgetAmount(10000);
    setUseTemplate(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, budgetId: string) => {
    e.stopPropagation(); // Prevent budget selection when clicking delete
    setBudgetToDelete(budgetId);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (budgetToDelete) {
      console.log('Confirming deletion of budget:', budgetToDelete);
      console.log('Budget ID type:', typeof budgetToDelete);
      console.log('Budget ID value:', budgetToDelete);
      try {
        // Show loading state
        const deleteButton = document.getElementById('confirm-delete-button');
        if (deleteButton) {
          deleteButton.textContent = 'Deleting...';
          deleteButton.setAttribute('disabled', 'true');
        }
        
        // First test the Supabase connection
        console.log('Testing Supabase connection before deletion...');
        try {
          const testResult = await testSupabase();
          console.log('Connection test result:', testResult);
          if (!testResult) {
            console.error('Database connection test failed');
            alert('Database connection test failed. Cannot proceed with deletion.');
            if (deleteButton) {
              deleteButton.textContent = 'Delete Budget';
              deleteButton.removeAttribute('disabled');
            }
            return;
          }
        } catch (testError) {
          console.error('Error testing database connection:', testError);
          alert('Error testing database connection. Cannot proceed with deletion.');
          if (deleteButton) {
            deleteButton.textContent = 'Delete Budget';
            deleteButton.removeAttribute('disabled');
          }
          return;
        }
        
        const success = await deleteBudget(budgetToDelete);
        console.log('Delete operation completed with success status:', success);
        
        if (success) {
          // Success - close the modal and reset
          setBudgetToDelete(null);
          setShowDeleteModal(false);
          // Force refresh budgets list
          window.location.reload();
        } else {
          // Error - show error message and re-enable button
          console.error('Failed to delete budget');
          alert('Failed to delete budget. Please check the console for details.');
          if (deleteButton) {
            deleteButton.textContent = 'Delete Budget';
            deleteButton.removeAttribute('disabled');
          }
        }
      } catch (error) {
        console.error('Error in handleConfirmDelete:', error);
        alert(`Error deleting budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
        const deleteButton = document.getElementById('confirm-delete-button');
        if (deleteButton) {
          deleteButton.textContent = 'Delete Budget';
          deleteButton.removeAttribute('disabled');
        }
      }
    } else {
      console.error('No budget ID set for deletion');
      alert('No budget selected for deletion.');
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="loading-card">
              <div className="flex justify-between items-start">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading budgets: {error}
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-soft relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-5"></div>
      <AnimatedContainer className="relative" variant="fadeIn" duration={0.4}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <motion.h2 
              className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              My Budgets
            </motion.h2>
            <button 
              onClick={async () => {
                console.log('Testing Supabase connection...');
                try {
                  const testResult = await testSupabase();
                  console.log('Test result:', testResult);
                  alert(testResult ? 'Database connection successful!' : 'Database connection failed');
                } catch (error) {
                  console.error('Test error:', error);
                  alert('Test error: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
              }}
              className="text-xs bg-blue-200 hover:bg-blue-300 text-blue-800 px-2 py-1 rounded"
              title="Test database connection"
            >
              Test DB
            </button>
          </div>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-md flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <PlusCircle size={18} />
            <span>Create Budget</span>
          </motion.button>
        </div>
      </AnimatedContainer>

      <AnimatedContainer className="relative" delay={0.1}>
        {budgets.length === 0 ? (
          <motion.div 
            className="text-center py-8 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 text-gray-400 dark:text-gray-500">
              <PlusCircle size={48} className="mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">No budgets found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md mx-auto">Create your first budget to get started tracking your expenses and managing your finances.</p>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn btn-primary btn-sm inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle size={16} />
              <span>Create Budget</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {budgets.map((budget, index) => (
                <motion.div 
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <motion.div 
                    className={`budget-card p-5 cursor-pointer ${
                      selectedBudget?.id === budget.id 
                        ? 'ring-2 ring-primary border-transparent shadow-soft-md' 
                        : 'hover:border-primary/30 hover:shadow-soft-md'
                    }`}
                    onClick={() => selectBudget(budget.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="card-gradient-overlay"></div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {budget.name}
                        {selectedBudget?.id === budget.id && (
                          <span className="ml-2 text-primary inline-block">
                            <CheckCircle2 size={14} className="inline" />
                          </span>
                        )}
                      </h3>
                      <div className="flex gap-2">
                        <motion.button 
                          aria-label="Edit budget"
                          title="Edit budget"
                          className="text-gray-400 hover:text-primary transition-colors rounded-full p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button 
                          aria-label="Delete budget"
                          title="Delete budget"
                          className="text-gray-400 hover:text-destructive transition-colors rounded-full p-1 hover:bg-destructive-50 dark:hover:bg-destructive/10 z-10"
                          onClick={(e) => {
                            // Stop propagation to parent elements
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Log the click event for debugging
                            console.log('Delete button clicked for budget:', budget.id);
                            
                            // Set state for the delete modal
                            setBudgetToDelete(budget.id);
                            setShowDeleteModal(true);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-base font-medium text-primary-700 dark:text-primary-300">
                        {new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(budget.total_amount)}
                      </p>
                      <div className="flex justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(budget.created_at).toLocaleDateString()}
                        </p>
                        {selectedBudget?.id === budget.id && (
                          <motion.span 
                            className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Active <ArrowRight size={10} />
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </AnimatedContainer>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4 text-red-500">
              <AlertTriangle className="mr-2" size={24} />
              <h3 className="text-xl font-bold">Delete Budget</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this budget? This action cannot be undone and will remove all categories and expenses associated with this budget.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  console.log('Cancel clicked');
                  setShowDeleteModal(false);
                  setBudgetToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded text-gray-800 hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-button"
                type="button"
                onClick={() => {
                  console.log('Confirm delete clicked with budget:', budgetToDelete);
                  handleConfirmDelete();
                }}
                className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600 font-medium disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                Delete Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-elevation-3 relative overflow-hidden"
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-radial from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent opacity-50"></div>
              <div className="relative">
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
                  Create New Budget
                </h3>
                <form onSubmit={handleCreateBudget}>
                  <div className="mb-4">
                    <label htmlFor="budgetName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Budget Name
                    </label>
                    <input
                      id="budgetName"
                      type="text"
                      value={newBudgetName}
                      onChange={(e) => setNewBudgetName(e.target.value)}
                      className="form-input w-full focus:ring-primary/50 focus:border-primary/50"
                      placeholder="e.g., Monthly Budget"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="budgetAmount" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Total Budget Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">NOK</span>
                      <input
                        id="budgetAmount"
                        type="number"
                        value={newBudgetAmount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            setNewBudgetAmount(value);
                          }
                        }}
                        className="form-input w-full pl-12 focus:ring-primary/50 focus:border-primary/50"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-5 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useTemplate}
                        onChange={(e) => setUseTemplate(e.target.checked)}
                        className="rounded text-primary focus:ring-primary/25 h-4 w-4"
                      />
                      <span className="text-sm font-medium">Use default categories template</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">Creates a set of predefined categories for this budget</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn btn-outline btn-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Create
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Budget Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setBudgetToDelete(null);
              setShowDeleteModal(false);
            }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-elevation-3 relative overflow-hidden"
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-radial from-destructive/5 to-transparent dark:from-destructive/10 dark:to-transparent opacity-50"></div>
              <div className="relative">
                <div className="flex items-center mb-4 text-destructive">
                  <AlertTriangle className="mr-2" />
                  <h3 className="text-xl font-bold">Delete Budget</h3>
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this budget? This action cannot be undone and will remove all associated categories and expenses.
                </p>
                <div className="flex justify-end gap-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setBudgetToDelete(null);
                      setShowDeleteModal(false);
                    }}
                    className="btn btn-outline btn-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="btn btn-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
