import React, { useState, useMemo } from 'react';
import { PlusCircle, Trash2, Edit2, Check, X, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { CategoryWithSpent, NewExpenseData } from './BudgetTypes';
import { Expense } from '@/lib/supabase';
import { formatCurrency } from './BudgetCalculations';
import './budgetTracker.css';

interface ExpensesViewProps {
  categories: CategoryWithSpent[];
  expenses: Expense[];
  onAddExpense: (expense: NewExpenseData) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, updatedData: Partial<Expense>) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({
  categories,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense
}) => {
  // Local state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<NewExpenseData>({
    category_id: categories.length > 0 ? categories[0].id : '',
    description: '',
    amount: 0,
    budgeted_amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time',
    is_actual: false // Default to budgeted expense
  });
  
  // State for expense editing
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editedExpense, setEditedExpense] = useState<{
    amount: number;
    budgeted_amount: number;
    description: string;
    category_id: string;
    date: string;
    recurring: 'monthly' | 'one-time';
    is_actual: boolean;
  }>({  
    amount: 0,
    budgeted_amount: 0,
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time',
    is_actual: false
  });

  // State for sorting
  type SortField = 'category' | 'description' | 'budgeted' | 'actual' | 'status' | 'date' | 'type';
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: 'asc' | 'desc';
  }>({ field: 'date', direction: 'desc' });

  // State for filtering
  const [filters, setFilters] = useState<{
    category: string;
    description: string;
    status: '' | 'planned' | 'actual';
    type: '' | 'one-time' | 'monthly';
  }>({
    category: '',
    description: '',
    status: '',
    type: ''
  });
  
  // Toggle showing the filter row
  const [showFilters, setShowFilters] = useState(false);

  // Handle form submission
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for required fields
    if (!newExpense.category_id || !newExpense.description) {
      alert('Vennligst fyll ut kategori og beskrivelse');
      return;
    }
    
    // For actual expenses, validate actual amount
    if (newExpense.is_actual && (!newExpense.amount || newExpense.amount <= 0)) {
      alert('Vennligst fyll inn faktisk beløp for en faktisk utgift');
      return;
    }
    
    // For planned expenses, validate budgeted amount
    if (!newExpense.is_actual && (!newExpense.budgeted_amount || newExpense.budgeted_amount <= 0)) {
      alert('Vennligst fyll inn budsjettert beløp for en planlagt utgift');
      return;
    }
    
    onAddExpense(newExpense);
    setNewExpense({
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      amount: 0,
      budgeted_amount: 0,
      date: new Date().toISOString().split('T')[0],
      recurring: 'one-time',
      is_actual: true
    });
    setIsAddingExpense(false);
  };

  // Get category name by ID
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Ukjent kategori';
  };

  // Get category color by ID
  const getCategoryColor = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.color : '#ccc';
  };
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(currentConfig => {
      if (currentConfig.field === field) {
        // Toggle direction if clicking the same field
        return {
          field,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // Set new field with default descending direction
        return {
          field,
          direction: 'desc'
        };
      }
    });
  };
  
  // Handle filter change
  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(current => ({
      ...current,
      [field]: value
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      description: '',
      status: '',
      type: ''
    });
  };
  
  // Start editing an expense
  const startEditing = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditedExpense({
      amount: expense.amount || 0,
      budgeted_amount: expense.budgeted_amount || expense.amount || 0,
      description: expense.description || '',
      category_id: expense.category_id || (categories.length > 0 ? categories[0].id : ''),
      date: expense.date || new Date().toISOString().split('T')[0],
      recurring: (expense.recurring as 'monthly' | 'one-time') || 'one-time',
      is_actual: typeof expense.is_actual === 'boolean' ? expense.is_actual : true
    });
  };
  
  // Save the edited expense
  const saveEditedExpense = () => {
    // Validate budgeted amount
    if (editingExpenseId && 
        editedExpense.description.trim() !== '' && 
        (editedExpense.is_actual ? editedExpense.amount > 0 : editedExpense.budgeted_amount > 0)) {
      onUpdateExpense(editingExpenseId, editedExpense);
      cancelEditing();
    } else {
      alert('Beskrivelse må fylles ut og minst ett av beløpene må være større enn 0');
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingExpenseId(null);
    setEditedExpense({
      amount: 0,
      budgeted_amount: 0,
      description: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      date: new Date().toISOString().split('T')[0],
      recurring: 'one-time',
      is_actual: false
    });
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    // First, filter the expenses
    let filtered = [...expenses];
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category_id === filters.category);
    }
    
    // Filter by description
    if (filters.description) {
      const search = filters.description.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(search)
      );
    }
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(expense => {
        if (filters.status === 'planned') return !expense.is_actual;
        if (filters.status === 'actual') return expense.is_actual;
        return true;
      });
    }
    
    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(expense => expense.recurring === filters.type);
    }
    
    // Then, sort the filtered expenses
    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortConfig.field) {
        case 'category':
          aValue = getCategoryName(a.category_id);
          bValue = getCategoryName(b.category_id);
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'budgeted':
          aValue = a.budgeted_amount || a.amount || 0;
          bValue = b.budgeted_amount || b.amount || 0;
          break;
        case 'actual':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.is_actual ? 'actual' : 'planned';
          bValue = b.is_actual ? 'actual' : 'planned';
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'type':
          aValue = a.recurring;
          bValue = b.recurring;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [expenses, sortConfig, filters, categories]);

  // Helper for sort icon
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Administrer utgifter</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-text-light-primary dark:text-text-dark-primary border border-gray-300 dark:border-gray-600 px-3 py-1 rounded flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-expanded={showFilters ? 'true' : 'false'}
              aria-controls="expense-filters-panel"
            >
              <Filter size={16} className="mr-1" /> {showFilters ? 'Skjul filtre' : 'Vis filtre'}
            </button>
            <button 
              onClick={() => setIsAddingExpense(!isAddingExpense)} 
              className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded flex items-center hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              title="Legg til ny utgift"
            >
              <PlusCircle size={16} className="mr-1" /> Legg til utgift
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div id="expense-filters-panel" className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded mb-4 transition-colors duration-200">
            <h3 className="font-medium mb-3 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Filtrer utgifter</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Filtrer etter kategori"
                  aria-label="Filtrer etter kategori"
                >
                  <option value="">Alle kategorier</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                <input
                  type="text"
                  value={filters.description}
                  onChange={(e) => handleFilterChange('description', e.target.value)}
                  placeholder="Søk etter beskrivelse"
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Filtrer etter beskrivelse"
                  aria-label="Filtrer etter beskrivelse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value as '' | 'planned' | 'actual')}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Filtrer etter status"
                  aria-label="Filtrer etter status"
                >
                  <option value="">Alle utgifter</option>
                  <option value="planned">Planlagt</option>
                  <option value="actual">Faktisk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value as '' | 'one-time' | 'monthly')}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Filtrer etter utgiftstype"
                  aria-label="Filtrer etter utgiftstype"
                >
                  <option value="">Alle typer</option>
                  <option value="one-time">Engangsutgift</option>
                  <option value="monthly">Månedlig</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    description: '',
                    status: '',
                    type: ''
                  });
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Nullstill filtre
              </button>
            </div>
          </div>
        )}
        
        {/* Add Expense Form */}
        {isAddingExpense && (
          <form onSubmit={handleSubmitExpense} className="bg-primary-50 dark:bg-primary-900/30 p-4 mb-6 rounded transition-colors duration-200">
            <h3 className="font-medium mb-3 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Ny utgift</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select 
                  value={newExpense.category_id}
                  onChange={(event) => setNewExpense({...newExpense, category_id: event.target.value})}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Velg kategori"
                  required
                >
                  <option value="">Velg kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                <input 
                  type="text" 
                  value={newExpense.description}
                  onChange={(event) => setNewExpense({...newExpense, description: event.target.value})}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  placeholder="Beskrivelse"
                  required
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-sm font-medium mr-3">Type utgift</label>
                  <div className="flex">
                    <button 
                      type="button"
                      onClick={() => setNewExpense({...newExpense, is_actual: false})}
                      className={`px-2 py-1 text-xs rounded-l ${!newExpense.is_actual ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Planlagt
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewExpense({...newExpense, is_actual: true})}
                      className={`px-2 py-1 text-xs rounded-r ${newExpense.is_actual ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Faktisk
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{newExpense.is_actual ? 'Faktisk beløp' : 'Budsjettert beløp'}</label>
                  {newExpense.is_actual ? (
                    <input 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(event) => setNewExpense({...newExpense, amount: Number(event.target.value)})}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                      placeholder="0"
                      min="0"
                    />
                  ) : (
                    <input 
                      type="number" 
                      value={newExpense.budgeted_amount}
                      onChange={(event) => setNewExpense({...newExpense, budgeted_amount: Number(event.target.value)})}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                      placeholder="0"
                      min="0"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dato</label>
                <input 
                  type="date" 
                  value={newExpense.date}
                  onChange={(event) => setNewExpense({...newExpense, date: event.target.value})}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Velg dato for utgiften"
                  aria-label="Dato for utgiften"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  value={newExpense.recurring}
                  onChange={(event) => setNewExpense({...newExpense, recurring: event.target.value as 'one-time' | 'monthly'})}
                  className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                  title="Velg utgiftstype"
                  aria-label="Velg utgiftstype"
                >
                  <option value="one-time">Engangsutgift</option>
                  <option value="monthly">Månedlig utgift</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                type="button" 
                onClick={() => setIsAddingExpense(false)}
                className="mr-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-text-light-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Avbryt
              </button>
              <button 
                type="submit"
                className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              >
                Lagre utgift
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Expenses Table Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Utgiftsoversikt</h3>
        </div>
        
        {filteredAndSortedExpenses.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('category')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter kategori"
                  >
                    Kategori {getSortIcon('category')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('description')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter beskrivelse"
                  >
                    Beskrivelse {getSortIcon('description')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('budgeted')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter budsjettert beløp"
                  >
                    Budsjettert {getSortIcon('budgeted')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('actual')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter faktisk beløp"
                  >
                    Faktisk {getSortIcon('actual')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('status')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter status"
                  >
                    Status {getSortIcon('status')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('date')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter dato"
                  >
                    Dato {getSortIcon('date')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                  <button 
                    onClick={() => handleSort('type')} 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    title="Sorter etter type"
                  >
                    Type {getSortIcon('type')}
                  </button>
                </th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {filteredAndSortedExpenses.map(expense => {
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <select
                          value={editedExpense.category_id}
                          onChange={(e) => setEditedExpense({...editedExpense, category_id: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          title="Velg kategori"
                          aria-label="Velg kategori"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center">
                          <div className={`category-color-indicator category-color bg-[${getCategoryColor(expense.category_id)}]`} aria-hidden="true"></div>
                          {getCategoryName(expense.category_id)}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <input 
                          type="text" 
                          value={editedExpense.description} 
                          onChange={(e) => setEditedExpense({...editedExpense, description: e.target.value})} 
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          title="Beskrivelse"
                          aria-label="Beskrivelse"
                          placeholder="Beskrivelse"
                        />
                      ) : expense.description}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <input 
                          type="number" 
                          value={editedExpense.budgeted_amount} 
                          onChange={(e) => setEditedExpense({...editedExpense, budgeted_amount: Number(e.target.value)})} 
                          className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          title="Budsjettert beløp"
                          aria-label="Budsjettert beløp"
                          placeholder="0"
                          min="0"
                        />
                      ) : formatCurrency(expense.budgeted_amount || expense.amount || 0)}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <input 
                          type="number" 
                          value={editedExpense.amount} 
                          onChange={(e) => setEditedExpense({...editedExpense, amount: Number(e.target.value)})} 
                          className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          title="Faktisk beløp"
                          aria-label="Faktisk beløp"
                          placeholder="0"
                          min="0"
                        />
                      ) : formatCurrency(expense.amount || 0)}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <div className="flex items-center">
                          <select
                            value={editedExpense.is_actual ? "faktisk" : "planlagt"}
                            onChange={(e) => setEditedExpense({
                              ...editedExpense, 
                              is_actual: e.target.value === "faktisk"
                            })}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                            title="Utgiftsstatus"
                            aria-label="Utgiftsstatus"
                          >
                            <option value="planlagt">Planlagt</option>
                            <option value="faktisk">Faktisk</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {expense.is_actual === true ? (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded transition-colors duration-200">
                              Faktisk
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded transition-colors duration-200">
                              Planlagt
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <input 
                          type="date" 
                          value={editedExpense.date} 
                          onChange={(e) => setEditedExpense({...editedExpense, date: e.target.value})} 
                          className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          title="Velg dato for utgiften"
                          aria-label="Dato for utgiften"
                        />
                      ) : new Date(expense.date).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <select
                          value={editedExpense.recurring}
                          onChange={(e) => setEditedExpense({...editedExpense, recurring: e.target.value as 'monthly' | 'one-time'})}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-text-light-primary dark:text-text-dark-primary"
                          title="Velg utgiftstype"
                          aria-label="Velg utgiftstype"
                        >
                          <option value="one-time">Engangs</option>
                          <option value="monthly">Månedlig</option>
                        </select>
                      ) : (
                        expense.recurring === 'monthly' ? (
                          <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded transition-colors duration-200">Månedlig</span>
                        ) : (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-2 py-1 rounded transition-colors duration-200">Engangs</span>
                        )
                      )}
                    </td>
                    <td className="py-3">
                      {editingExpenseId === expense.id ? (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={saveEditedExpense}
                            className="text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-300"
                            title="Lagre"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={cancelEditing}
                            className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300"
                            title="Avbryt"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => startEditing(expense)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                            title="Rediger utgift"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteExpense(expense.id)}
                            className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 transition-colors duration-200"
                            title="Slett utgift"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
            {expenses.length > 0 ? 'Ingen utgifter funnet med valgte filtre' : 'Ingen utgifter registrert ennå'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesView;
