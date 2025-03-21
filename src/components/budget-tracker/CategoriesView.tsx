import React, { useState, useMemo } from 'react';
import { PlusCircle, Trash2, Edit2, Check, X, Filter, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
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
  const [editedName, setEditedName] = useState<string>('');

  // State for filtering and sorting
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    minBudget: '',
    maxBudget: '',
  });
  const [sorting, setSorting] = useState({
    field: 'name',
    direction: 'asc' as 'asc' | 'desc'
  });

  // Handle sorting
  const handleSort = (field: string) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sorting.field !== field) return <ArrowUpDown size={14} className="ml-1" />;
    return sorting.direction === 'asc' ? 
      <ChevronUp size={14} className="ml-1" /> : 
      <ChevronDown size={14} className="ml-1" />;
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      name: '',
      minBudget: '',
      maxBudget: '',
    });
  };

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    // Apply filters
    let result = [...categories];
    
    if (filters.name) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.minBudget && !isNaN(Number(filters.minBudget))) {
      result = result.filter(category => 
        category.budget >= Number(filters.minBudget)
      );
    }
    
    if (filters.maxBudget && !isNaN(Number(filters.maxBudget))) {
      result = result.filter(category => 
        category.budget <= Number(filters.maxBudget)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sorting.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'percentOfTotal':
          const aPercent = totalBudget > 0 ? (a.budget / totalBudget) * 100 : 0;
          const bPercent = totalBudget > 0 ? (b.budget / totalBudget) * 100 : 0;
          comparison = aPercent - bPercent;
          break;
        case 'spent':
          comparison = (a.spent || 0) - (b.spent || 0);
          break;
        case 'remaining':
          comparison = (a.remaining || 0) - (b.remaining || 0);
          break;
        case 'percentUsed':
          const aPercentUsed = a.budget > 0 ? ((a.spent || 0) / a.budget) * 100 : 0;
          const bPercentUsed = b.budget > 0 ? ((b.spent || 0) / b.budget) * 100 : 0;
          comparison = aPercentUsed - bPercentUsed;
          break;
        default:
          comparison = 0;
      }
      
      return sorting.direction === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [categories, filters, sorting, totalBudget]);

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
  
  // Start editing a category budget and name
  const startEditing = (categoryId: string, currentBudget: number, currentName: string) => {
    setEditingCategoryId(categoryId);
    setEditedBudget(currentBudget);
    setEditedName(currentName);
  };
  
  // Save the edited category details
  const saveEditedCategory = () => {
    if (!editingCategoryId) return;
    
    if (editedBudget <= 0) {
      alert('Budsjett må være større enn 0');
      return;
    }
    
    if (!editedName.trim()) {
      alert('Kategorinavn kan ikke være tomt');
      return;
    }
    
    onUpdateCategory(editingCategoryId, { 
      budget: editedBudget,
      name: editedName
    });
    cancelEditing();
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditedBudget(0);
    setEditedName('');
  };

  return (
    <div className="space-y-6">
      {/* Category Management Card */}
      <div>
        <div className="flex justify-end items-center mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="text-text-light-primary dark:text-text-dark-primary border border-gray-300 dark:border-gray-600 px-3 py-1 rounded flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-expanded={showFilters ? 'true' : 'false'}
              aria-controls="category-filters-panel"
            >
              <Filter size={16} className="mr-1" /> {showFilters ? 'Skjul filtre' : 'Vis filtre'}
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div id="category-filters-panel" className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded mb-4 transition-colors duration-200">
            <h3 className="font-medium mb-3 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Filtrer kategorier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Navn</label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Søk etter navn"
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Filtrer etter kategorinavn"
                  aria-label="Filtrer etter kategorinavn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min. budsjett</label>
                <input
                  type="number"
                  name="minBudget"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  placeholder="Minimum"
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  min="0"
                  title="Filtrer etter minste budsjettverdi"
                  aria-label="Filtrer etter minste budsjettverdi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maks. budsjett</label>
                <input
                  type="number"
                  name="maxBudget"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  placeholder="Maksimum"
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  min="0"
                  title="Filtrer etter høyeste budsjettverdi"
                  aria-label="Filtrer etter høyeste budsjettverdi"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Nullstill filtre
              </button>
            </div>
          </div>
        )}
        
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
        
        <h3 className="text-xl font-semibold mt-6 mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Kategorioversikt</h3>
        <div className="overflow-x-auto dark:bg-[#2A2A2A] bg-white rounded-xl shadow-lg dark:shadow-slate-900/20 border border-gray-200 dark:border-slate-800 transition-all duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
          <thead>
            <tr>
              <th className="py-3 px-6 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                <button 
                  onClick={() => handleSort('name')} 
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  title="Sorter etter kategorinavn"
                >
                  Kategori {getSortIcon('name')}
                </button>
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                <button 
                  onClick={() => handleSort('budget')} 
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  title="Sorter etter budsjett"
                >
                  Budsjett {getSortIcon('budget')}
                </button>
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                <button 
                  onClick={() => handleSort('percentOfTotal')} 
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  title="Sorter etter prosentandel av total"
                >
                  % av total {getSortIcon('percentOfTotal')}
                </button>
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                <button 
                  onClick={() => handleSort('spent')} 
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  title="Sorter etter brukt beløp"
                >
                  Brukt {getSortIcon('spent')}
                </button>
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                <button 
                  onClick={() => handleSort('remaining')} 
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  title="Sorter etter gjenstående beløp"
                >
                  Gjenstående {getSortIcon('remaining')}
                </button>
              </th>
              <th className="py-3 px-6 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                <button 
                  onClick={() => handleSort('percentUsed')} 
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  title="Sorter etter prosentandel brukt"
                >
                  Fremgang {getSortIcon('percentUsed')}
                </button>
              </th>
              <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200" colSpan={2}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            {filteredAndSortedCategories.map(category => {
              const percentOfTotal = totalBudget > 0 
                ? ((category.budget / totalBudget) * 100).toFixed(1) 
                : '0.0';
              
              const percentUsed = category.budget > 0 
                ? (((category.spent || 0) / category.budget) * 100).toFixed(1) 
                : '0.0';
              
              return (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                  <td className="py-3 px-6 flex items-center">
                    <div className="category-color-indicator category-color" style={{ '--category-color': category.color } as React.CSSProperties} aria-hidden="true"></div>
                    {editingCategoryId === category.id ? (
                      <input 
                        type="text" 
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="ml-2 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                        aria-label="Edit category name"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="py-3 px-6">
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
                          onClick={saveEditedCategory}
                          className="text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-300"
                          title="Save"
                          aria-label="Save category changes"
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
                      <div className="flex items-center">
                        {formatCurrency(category.budget)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6">{percentOfTotal}%</td>
                  <td className="py-3 px-6">{formatCurrency(category.spent || 0)}</td>
                  <td className={`py-3 px-6 ${(category.remaining || 0) < 0 ? 'text-danger-600 dark:text-danger-400' : ''}`}>
                    {formatCurrency(category.remaining || 0)}
                  </td>
                  <td className="py-3 px-6" colSpan={2}>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2 transition-colors duration-200">
                        <div 
                          className={`h-3 rounded-full ${parseFloat(percentUsed) > 90 ? 'bg-danger-500 dark:bg-danger-600' : 'bg-primary-600 dark:bg-primary-500'} ${getProgressBarStyle(Math.min(100, parseFloat(percentUsed)))} transition-all duration-300 ease-in-out`}
                        ></div>
                      </div>
                      <span className="text-sm">{percentUsed}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center space-x-2 justify-end">
                      <button 
                        onClick={() => startEditing(category.id, category.budget, category.name)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                        title="Rediger kategori"
                        aria-label={`Rediger ${category.name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteCategory(category.id)}
                        className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 transition-colors duration-200"
                        title="Slett kategori"
                        aria-label={`Slett ${category.name} kategori`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="border-b dark:border-gray-700 bg-primary-50 dark:bg-primary-900/20 transition-colors duration-200">
              <td className="py-3 px-6 font-bold">Total</td>
              <td className="py-3 px-6 font-bold">{formatCurrency(calculateTotalAllocated(categories))}</td>
              <td className="py-3 px-6 font-bold">100%</td>
              <td className="py-3 px-6 font-bold">{formatCurrency(totals.spent)}</td>
              <td className="py-3 px-6 font-bold">{formatCurrency(totals.remaining)}</td>
              <td className="py-3 px-6" colSpan={3}>
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
              <td className="py-3 px-6 font-medium">Ufordelt budsjett</td>
              <td className="py-3 px-6 font-bold" colSpan={7}>
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
    </div>
  );
};

export default CategoriesView;
