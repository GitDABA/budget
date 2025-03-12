import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { CategoryWithSpent, NewCategoryData, BudgetTotals } from './BudgetTypes';
import { formatCurrency, calculateTotalAllocated, calculateUnallocatedBudget } from './BudgetCalculations';
import { getProgressBarStyle } from '@/utils/styleUtils';
import './budgetTracker.css';

// Color palette for categories
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

interface CategoriesViewProps {
  categories: CategoryWithSpent[];
  totalBudget: number;
  totals: BudgetTotals;
  onAddCategory: (category: NewCategoryData) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (id: string, updatedData: Partial<CategoryWithSpent>) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  totalBudget,
  totals,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory
}) => {
  // Local state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategoryData>({ 
    name: '', 
    budget: 0, 
    color: COLORS[Math.floor(Math.random() * COLORS.length)] 
  });
  
  // State for category editing
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedBudget, setEditedBudget] = useState<number>(0);

  // Handle form submission
  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || newCategory.budget <= 0) {
      alert('Vennligst fyll ut alle feltene');
      return;
    }
    
    onAddCategory(newCategory);
    setNewCategory({ name: '', budget: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    setIsAddingCategory(false);
  };
  
  // Start editing a category budget
  const startEditing = (categoryId: string, currentBudget: number) => {
    setEditingCategoryId(categoryId);
    setEditedBudget(currentBudget);
  };
  
  // Save the edited budget
  const saveEditedBudget = () => {
    if (editingCategoryId && editedBudget > 0) {
      onUpdateCategory(editingCategoryId, { budget: editedBudget });
      cancelEditing();
    } else if (editedBudget <= 0) {
      alert('Budsjett må være større enn 0');
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditedBudget(0);
  };

  return (
    <div className="space-y-6">
      {/* Category Management Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Administrer kategorier</h2>
          <button 
            onClick={() => setIsAddingCategory(!isAddingCategory)} 
            className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded flex items-center hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          >
            <PlusCircle size={16} className="mr-1" /> Legg til kategori
          </button>
        </div>
        
        {/* Add Category Form */}
        {isAddingCategory && (
          <form onSubmit={handleSubmitCategory} className="bg-primary-50 dark:bg-primary-900/30 p-4 mb-6 rounded transition-colors duration-200">
            <h3 className="font-medium mb-3 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Ny kategori</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Navn</label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  placeholder="Kategorinavn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Budsjett</label>
                <input 
                  type="number" 
                  value={newCategory.budget}
                  onChange={(e) => setNewCategory({...newCategory, budget: Number(e.target.value)})}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Farge</label>
                <div className="flex space-x-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, color})}
                      className={`color-selector-button ${newCategory.color === color ? 'selected' : ''}`}
                      style={{ '--btn-color': color } as React.CSSProperties}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                type="button" 
                onClick={() => setIsAddingCategory(false)}
                className="mr-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-text-light-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Avbryt
              </button>
              <button 
                type="submit"
                className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              >
                Lagre kategori
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Categories Table Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full overflow-x-auto">
        <h3 className="font-medium mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Kategorioversikt</h3>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
          <thead>
            <tr>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Kategori</th>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Budsjett</th>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">% av total</th>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Brukt</th>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Gjenstående</th>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200" colSpan={3}>Fremgang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            {categories.map(category => {
              const percentOfTotal = totalBudget > 0 
                ? ((category.budget / totalBudget) * 100).toFixed(1) 
                : '0.0';
              
              const percentUsed = category.budget > 0 
                ? (((category.spent || 0) / category.budget) * 100).toFixed(1) 
                : '0.0';
              
              return (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                  <td className="py-3 flex items-center">
                    <div className="category-color-indicator category-color" style={{ '--category-color': category.color } as React.CSSProperties} aria-hidden="true"></div>
                    {category.name}
                  </td>
                  <td className="py-3">
                    {editingCategoryId === category.id ? (
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          value={editedBudget} 
                          onChange={(e) => setEditedBudget(Number(e.target.value))} 
                          className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          aria-label="Edit budget amount"
                        />
                        <button 
                          onClick={saveEditedBudget}
                          className="text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-300"
                          title="Save"
                          aria-label="Save budget change"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300"
                          title="Cancel"
                          aria-label="Cancel budget edit"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {formatCurrency(category.budget)}
                        <button 
                          onClick={() => startEditing(category.id, category.budget)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          title="Edit Budget"
                          aria-label={`Edit budget for ${category.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3">{percentOfTotal}%</td>
                  <td className="py-3">{formatCurrency(category.spent || 0)}</td>
                  <td className={`py-3 ${(category.remaining || 0) < 0 ? 'text-danger-600 dark:text-danger-400' : ''}`}>
                    {formatCurrency(category.remaining || 0)}
                  </td>
                  <td className="py-3" colSpan={2}>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2 transition-colors duration-200">
                        <div 
                          className={`h-3 rounded-full ${parseFloat(percentUsed) > 90 ? 'bg-danger-500 dark:bg-danger-600' : 'bg-primary-600 dark:bg-primary-500'} ${getProgressBarStyle(Math.min(100, parseFloat(percentUsed)))} transition-all duration-300 ease-in-out`}
                        ></div>
                      </div>
                      <span className="text-sm">{percentUsed}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => onDeleteCategory(category.id)}
                      className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 transition-colors duration-200"
                      title="Delete Category"
                      aria-label={`Delete ${category.name} category`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="border-b dark:border-gray-700 bg-primary-50 dark:bg-primary-900/20 transition-colors duration-200">
              <td className="py-3 font-bold">Total</td>
              <td className="py-3 font-bold">{formatCurrency(calculateTotalAllocated(categories))}</td>
              <td className="py-3 font-bold">100%</td>
              <td className="py-3 font-bold">{formatCurrency(totals.spent)}</td>
              <td className="py-3 font-bold">{formatCurrency(totals.remaining)}</td>
              <td className="py-3" colSpan={3}>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2 transition-colors duration-200">
                    <div 
                      className={`h-3 rounded-full ${parseFloat(totals.percentUsed) > 90 ? 'bg-danger-500 dark:bg-danger-600' : 'bg-primary-600 dark:bg-primary-500'} ${getProgressBarStyle(Math.min(100, parseFloat(totals.percentUsed)))} transition-all duration-300 ease-in-out`}
                    ></div>
                  </div>
                  <span className="text-sm">{totals.percentUsed}%</span>
                </div>
              </td>
            </tr>
            <tr className={`${calculateUnallocatedBudget(totalBudget, categories) < 0 ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300' : 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300'} transition-colors duration-200`}>
              <td className="py-3 font-medium">Ufordelt budsjett</td>
              <td className="py-3 font-bold" colSpan={7}>
                {formatCurrency(calculateUnallocatedBudget(totalBudget, categories))}
                {calculateUnallocatedBudget(totalBudget, categories) < 0 && 
                  <span className="ml-2 text-xs text-danger-600 dark:text-danger-400 transition-colors duration-200">
                    Advarsel: Du har fordelt mer enn totalbudsjettet!
                  </span>
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesView;
