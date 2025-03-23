import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { CategoryWithSpent, NewExpenseData } from './BudgetTypes';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: NewExpenseData) => void;
  categories: CategoryWithSpent[];
  isMobile?: boolean;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddExpense, 
  categories,
  isMobile = false
}) => {
  const [newExpense, setNewExpense] = useState<NewExpenseData>({
    description: '',
    amount: 0,
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time'
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && categories.length > 0) {
      setNewExpense({
        description: '',
        amount: 0,
        category_id: categories[0].id,
        date: new Date().toISOString().split('T')[0],
        recurring: 'one-time'
      });
    }
  }, [isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description.trim() === '' || newExpense.amount <= 0 || !newExpense.category_id) {
      alert('Vennligst fyll ut alle felt. Beløp må være større enn 0.');
      return;
    }
    onAddExpense(newExpense);
    onClose();
  };

  // We'll use a single animation style for consistency
  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        className="bg-card-light dark:bg-card-dark rounded-lg p-6 max-w-md w-full shadow-dropdown-light dark:shadow-dropdown-dark transition-colors duration-200"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">Legg til ny utgift</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Lukk"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="expenseDescription" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Beskrivelse
                </label>
                <input
                  type="text"
                  id="expenseDescription"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  placeholder="F.eks. Dagligvarer, Kino, etc."
                />
              </div>
              
              <div>
                <label htmlFor="expenseAmount" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Beløp
                </label>
                <input
                  type="number"
                  id="expenseAmount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  min="1"
                  step="1"
                  placeholder="Angi beløp"
                />
              </div>
              
              <div>
                <label htmlFor="expenseCategory" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Kategori
                </label>
                <select
                  id="expenseCategory"
                  value={newExpense.category_id}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="expenseDate" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Dato
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="expenseDate"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-300 pointer-events-none" size={16} />
                </div>
              </div>
              
              <div>
                <label htmlFor="expenseRecurring" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Type
                </label>
                <select
                  id="expenseRecurring"
                  value={newExpense.recurring}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, recurring: e.target.value as 'one-time' | 'monthly' }))}
                  className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <option value="one-time">Engangsbetaling</option>
                  <option value="monthly">Månedlig</option>
                </select>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Legg til utgift
                </button>
              </div>
            </form>
      </motion.div>
    </div>
  );
};

export default AddExpenseModal;
