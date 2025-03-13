import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewCategoryData } from './BudgetTypes';

// Color palette for categories
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: NewCategoryData) => void;
  isMobile?: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddCategory,
  isMobile = false
}) => {
  const [newCategory, setNewCategory] = useState<NewCategoryData>({ 
    name: '', 
    budget: 0, 
    color: COLORS[Math.floor(Math.random() * COLORS.length)] 
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewCategory({ 
        name: '', 
        budget: 0, 
        color: COLORS[Math.floor(Math.random() * COLORS.length)] 
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim() === '' || newCategory.budget <= 0) {
      alert('Vennligst fyll ut alle felt. Budsjett må være større enn 0.');
      return;
    }
    onAddCategory(newCategory);
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
              <h2 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">Legg til ny kategori</h2>
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
                <label htmlFor="categoryName" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                  Kategorinavn
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  placeholder="F.eks. Mat, Transport, etc."
                />
              </div>
              
              <div>
                <label htmlFor="categoryBudget" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                  Budsjett
                </label>
                <input
                  type="number"
                  id="categoryBudget"
                  value={newCategory.budget}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  min="1"
                  placeholder="Angi beløp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                  Farge
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-all duration-200 category-color-button ${newCategory.color === color ? 'ring-2 ring-offset-2 ring-primary-600 dark:ring-primary-400' : ''}`}
                      data-color={color}
                      aria-label={`Farge ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Legg til kategori
                </button>
              </div>
            </form>
      </motion.div>
    </div>
  );
};

export default AddCategoryModal;
