import React from 'react';
import { PlusCircle, FilePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingActionButtonsProps {
  onAddCategory: () => void;
  onAddExpense: () => void;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onAddCategory,
  onAddExpense
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-50">
      {/* Add Category Button */}
      <motion.button
        className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-800 dark:bg-blue-900 text-white shadow-lg hover:bg-blue-900 dark:hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        onClick={onAddCategory}
        aria-label="Legg til kategori"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilePlus size={25} />
      </motion.button>
      
      {/* Add Expense Button */}
      <motion.button
        className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 dark:bg-indigo-700 text-white shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={onAddExpense}
        aria-label="Legg til utgift"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PlusCircle size={25} />
      </motion.button>
      
      {/* Tooltip labels - removed as they were not appearing with the current implementation */}
    </div>
  );
};

export default FloatingActionButtons;
