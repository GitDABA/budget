import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProgressBarStyle, getBackgroundColorStyle } from '@/utils/styleUtils';
import { PlusCircle, Trash2, Save, Download, Edit, Calendar, DollarSign, BarChart2, AlertTriangle } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, Expense } from '@/lib/supabase';

// Define months for use in the app (in Norwegian)
const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const currentMonth = new Date().getMonth();

// Get current year
const currentYear = new Date().getFullYear();

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

// Responsive text abbreviation based on container width
const useResponsiveTextLength = () => {
  // Scale factors based on viewport width
  const baseLength = 14;
  const mobileFactor = 0.7;  // 70% of base length on mobile
  const tabletFactor = 0.9;  // 90% of base length on tablet
  const desktopFactor = 1.2; // 120% of base length on desktop
  
  // Adjust max length based on screen size
  const getMaxLength = (baseMaxLength: number) => {
    if (typeof window === 'undefined') return baseMaxLength; // SSR fallback
    
    const width = window.innerWidth;
    
    if (width < 640) { // Mobile
      return Math.max(8, Math.floor(baseMaxLength * mobileFactor));
    } else if (width < 1024) { // Tablet
      return Math.max(10, Math.floor(baseMaxLength * tabletFactor));
    } else { // Desktop
      return Math.max(12, Math.floor(baseMaxLength * desktopFactor));
    }
  };
  
  return getMaxLength;
};

// Abbreviate text if too long
const abbreviateText = (text: string, baseMaxLength = 14) => {
  if (!text) return '';
  
  // Dynamic adjustment based on available space
  const getMaxLength = useResponsiveTextLength();
  const maxLength = getMaxLength(baseMaxLength);
  
  if (text.length <= maxLength) return text;
  
  // For very short limits, use a more aggressive abbreviation
  if (maxLength <= 10) {
    // For very short text, try to keep first word intact if possible
    const firstSpace = text.indexOf(' ');
    if (firstSpace > 0 && firstSpace < maxLength - 2) {
      return text.substring(0, firstSpace) + '...';
    }
  }
  
  return text.substring(0, maxLength - 3) + '...';
};

interface CategoryWithSpent extends Category {
  spent?: number;
  remaining?: number;
}

interface ForecastData {
  name: string;
  month: number;
  total: number;
  cumulative?: number;
  remaining?: number;
  [key: string]: any; // Allow dynamic category names as properties
}

const BudgetTracker: React.FC = () => {
  // Get budget context
  const { selectedBudget, fetchBudgetDetails, createCategory, createExpense, deleteCategory } = useBudget();
  // Get theme context
  const { theme } = useTheme();
  
  // Control modal visibility explicitly
  const [showSetupModal, setShowSetupModal] = useState(false);
  // State management
  const [totalBudget, setTotalBudget] = useState(0);
  const [categories, setCategories] = useState<CategoryWithSpent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  
  // Load budget data when selectedBudget changes
  useEffect(() => {
    const loadBudgetData = async () => {
      if (!selectedBudget) return;
      
      setIsLoading(true);
      // Set total budget from selected budget
      setTotalBudget(selectedBudget.total_amount);
      
      // Fetch categories and expenses for the selected budget
      const details = await fetchBudgetDetails(selectedBudget.id);
      if (details) {
        setCategories(details.categories);
        setExpenses(details.expenses);
      }
      setIsLoading(false);
    };
    
    loadBudgetData();
  }, [selectedBudget, fetchBudgetDetails]);
  
  const [newCategory, setNewCategory] = useState({ name: '', budget: 0, color: COLORS[5] });
  const [newExpense, setNewExpense] = useState({
    category_id: '',
    description: '',
    amount: 0,
    budgeted_amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time' as 'one-time' | 'monthly',
    is_actual: true
  });
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  // Toggle category visibility
  const toggleCategoryVisibility = (id: string) => {
    setCategories(
      categories.map(category => 
        category.id === id 
          ? { ...category, visible: !category.visible } 
          : category
      )
    );
  };

  // Get visible category IDs for filtering expenses
  const getVisibleCategoryIds = () => categories.filter(c => c.visible).map(c => c.id);

  // Calculate spent amount per category
  const calculateSpentPerCategory = () => {
    return categories.map(category => {
      const spent = expenses
        .filter(expense => expense.category_id === category.id)
        .reduce((sum, expense) => {
          // Calculate actual spent based on recurring type
          let actualSpent = expense.amount;
          if (expense.recurring === 'monthly') {
            // Count months from expense date to current date
            const expenseDate = new Date(expense.date);
            const expenseMonth = expenseDate.getMonth();
            const expenseYear = expenseDate.getFullYear();
            
            // Calculate months between expense date and now
            const monthDiff = (currentYear - expenseYear) * 12 + (currentMonth - expenseMonth);
            
            // If expense is in the future, count it once for forecasting
            const multiplier = monthDiff < 0 ? 1 : monthDiff + 1;
            actualSpent = expense.amount * multiplier;
          }
          return sum + actualSpent;
        }, 0);
      
      return {
        ...category,
        spent: spent,
        remaining: category.budget - spent
      };
    });
  };

  // Generate forecast data
  const generateForecast = () => {
    const monthlyData: ForecastData[] = months.map((month, index) => {
      // Initial data structure for this month
      const monthData: ForecastData = {
        name: month,
        month: index,
        total: 0
      };

      // Add category specific spending for this month
      categories.forEach(category => {
        monthData[category.name] = 0;
      });

      return monthData;
    });

    // Fill data with actual and projected expenses
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();
      
      // Find category name
      const category = categories.find(c => c.id === expense.category_id);
      if (!category) return;
      
      if (expense.recurring === 'one-time') {
        // For one-time expenses, add them to the specific month
        if (expenseYear === currentYear) {
          monthlyData[expenseMonth][category.name] += expense.amount;
          monthlyData[expenseMonth].total += expense.amount;
        }
      } else if (expense.recurring === 'monthly') {
        // For monthly expenses, add them to all months from the expense date onwards
        for (let i = expenseMonth; i < 12; i++) {
          if (expenseYear <= currentYear) {
            monthlyData[i][category.name] += expense.amount;
            monthlyData[i].total += expense.amount;
          }
        }
      }
    });

    // Calculate cumulative spending
    let cumulative = 0;
    monthlyData.forEach(data => {
      cumulative += data.total;
      data.cumulative = cumulative;
      data.remaining = totalBudget - cumulative;
    });

    setForecast(monthlyData);
  };
  
  // Calculate total spent and remaining with respect to visibility
  const calculateTotals = () => {
    const visibleCategories = getVisibleCategoryIds();
    
    const totalSpent = expenses
      .filter(expense => visibleCategories.includes(expense.category_id))
      .reduce((sum, expense) => {
        if (expense.recurring === 'one-time') {
          return sum + expense.amount;
        } else if (expense.recurring === 'monthly') {
          const expenseDate = new Date(expense.date);
          const expenseMonth = expenseDate.getMonth();
          const monthDiff = currentMonth - expenseMonth + 1;
          return sum + (expense.amount * (monthDiff > 0 ? monthDiff : 1));
        }
        return sum;
      }, 0);
    
    return {
      spent: totalSpent,
      remaining: totalBudget - totalSpent,
      percentUsed: ((totalSpent / totalBudget) * 100).toFixed(1)
    };
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!selectedBudget) return;
    
    if (newCategory.name && newCategory.budget > 0) {
      // Optional: Check if adding this category would exceed total budget
      const wouldExceedBudget = calculateUnallocatedBudget() - newCategory.budget < 0;
      
      // You could either prevent creation or just warn the user
      if (wouldExceedBudget) {
        if (!window.confirm('Dette vil overskride totalbudsjettet. Vil du fortsette?')) {
          return;
        }
      }
      
      // Create category with proper budget_id
      const categoryToAdd = {
        name: newCategory.name,
        budget: newCategory.budget,
        color: COLORS[categories.length % COLORS.length],
        visible: true,
        budget_id: selectedBudget.id
      };
      
      // Use context function to create category in database
      const newCat = await createCategory(categoryToAdd);
      if (newCat) {
        setCategories([...categories, newCat as CategoryWithSpent]);
        setNewCategory({ name: '', budget: 0, color: COLORS[5] });
        setIsAddingCategory(false);
      }
    }
  };

  // Add new expense
  const handleAddExpense = async () => {
    if (!selectedBudget) return;
    
    if (newExpense.description && newExpense.amount > 0 && newExpense.category_id) {
      // Create expense with proper budget_id
      const expenseToAdd = {
        description: newExpense.description,
        amount: newExpense.amount,
        budgeted_amount: newExpense.amount, // Using the same value for actual and budgeted amount
        category_id: newExpense.category_id,
        date: newExpense.date,
        recurring: newExpense.recurring,
        budget_id: selectedBudget.id,
        is_actual: true // Marking this as an actual expense, not a planned one
      };
      
      // Use context function to create expense in database
      const newExp = await createExpense(expenseToAdd);
      if (newExp) {
        setExpenses([...expenses, newExp]);
        setNewExpense({
          category_id: '',
          description: '',
          amount: 0,
          budgeted_amount: 0,
          date: new Date().toISOString().split('T')[0],
          recurring: 'one-time' as 'one-time' | 'monthly',
          is_actual: true
        });
        setIsAddingExpense(false);
      }
    }
  };

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Delete category (and related expenses)
  const handleDeleteCategory = (id: string) => {
    if (!id) return;
    
    // Show confirmation dialog
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };
  
  // Handle confirmation of category deletion
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      console.log('Attempting to delete category:', categoryToDelete);
      setIsLoading(true);
      
      // Close the modal first
      setShowDeleteModal(false);
      
      // Use the context function to delete in the database
      const success = await deleteCategory(categoryToDelete);
      
      if (success) {
        console.log('Category successfully deleted');
        // The category has been deleted from the database, update local state
        setCategories(categories.filter(category => category.id !== categoryToDelete));
        setExpenses(expenses.filter(expense => expense.category_id !== categoryToDelete));
      } else {
        console.error('Failed to delete category');
        alert('Failed to delete category. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('An error occurred while deleting the category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add theme-sensitive CSS variables for charts
  useEffect(() => {
    const root = document.documentElement;
    const updateChartVariables = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      // Set chart-specific CSS variables
      root.style.setProperty('--tooltip-filter', isDarkMode ? 'brightness(0.85)' : 'none');
      root.style.setProperty('--chart-grid-opacity', isDarkMode ? '0.2' : '1');
      root.style.setProperty('--chart-text-color', isDarkMode ? 'var(--color-text-dark-primary)' : 'var(--color-text-light-primary)');
      
      // Add additional styles to enhance charts in dark mode
      const styleId = 'recharts-dark-mode-styles';
      let styleEl = document.getElementById(styleId);
      
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      
      if (isDarkMode) {
        styleEl.innerHTML = `
          .recharts-cartesian-axis-tick-value {
            fill: var(--color-text-dark-primary) !important;
          }
          .recharts-legend-item-text {
            color: var(--color-text-dark-primary) !important;
          }
          .recharts-tooltip-wrapper .recharts-default-tooltip {
            background-color: rgba(35, 35, 35, 0.95) !important; /* Updated darker background */
            border-color: rgba(71, 85, 105, 0.3) !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2) !important;
            backdrop-filter: blur(8px) !important;
            border-radius: 0.5rem !important;
            border: 1px solid rgba(71, 85, 105, 0.2) !important;
            padding: 12px !important;
          }
          .recharts-tooltip-wrapper .recharts-default-tooltip .recharts-tooltip-item {
            color: rgba(255, 255, 255, 0.95) !important; /* Brighter text for better visibility */
          }
          .recharts-default-tooltip .recharts-tooltip-label {
            color: rgba(210, 210, 210, 0.95) !important; /* Brighter label for better visibility */
            font-weight: 500 !important;
            margin-bottom: 6px !important;
          }
          .recharts-legend-wrapper {
            padding: 10px !important; 
            background-color: rgba(35, 35, 35, 0.9) !important; /* Updated darker background */
            border-radius: 0 0 8px 8px !important;
            backdrop-filter: blur(4px) !important;
            border-top: 1px solid rgba(148, 163, 184, 0.1) !important;
          }
          .recharts-default-legend .recharts-legend-item {
            margin-right: 20px !important;
          }
          .recharts-legend-item-text {
            display: inline-block !important;
            margin-left: 5px !important;
            color: rgba(226, 232, 240, 0.9) !important;
          }
          .recharts-surface {
            overflow: visible !important;
          }
          .recharts-layer.recharts-line-dots circle {
            filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5)) !important;
          }
        `;
      } else {
        styleEl.innerHTML = '';
      }
    };
    
    // Initial setup
    updateChartVariables();
    
    // Setup mutation observer to detect theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateChartVariables();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Update forecasts when data changes
  useEffect(() => {
    generateForecast();
  }, [expenses, categories, totalBudget]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate total budget allocated to categories
  const calculateTotalAllocated = () => {
    return categories.reduce((sum, category) => {
      const budget = typeof category.budget === 'string' ? parseFloat(category.budget) : category.budget;
      return sum + budget;
    }, 0);
  };
  
  // Calculate unallocated budget
  const calculateUnallocatedBudget = () => {
    const allocated = calculateTotalAllocated();
    return totalBudget - allocated;
  };

  // Export data as JSON
  const handleExportData = () => {
    const data = {
      totalBudget,
      categories,
      expenses,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `budsjett_eksport_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Calculated values
  const categoryData = calculateSpentPerCategory();
  const visibleCategoryData = categoryData.filter(category => category.visible);
  const totals = calculateTotals();

  // Return JSX structure
  return (
    <div className="h-full">
      {!selectedBudget ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
          {/* Initial Setup Modal */}
          {showSetupModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 max-w-md w-full shadow-dropdown-light dark:shadow-dropdown-dark transition-colors duration-200">
                <h2 className="text-xl font-bold mb-4 text-text-light-primary dark:text-text-dark-primary">Oppsett av budsjett</h2>
                <p className="mb-4 text-text-light-secondary dark:text-text-dark-secondary">Velkommen til budsjettplanleggeren! Vennligst sett opp ditt totalbudsjett for å komme i gang.</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary">Totalbudsjett for {currentYear}</label>
                  <input 
                    type="number" 
                    value={totalBudget}
                    onChange={(event) => setTotalBudget(Number(event.target.value))}
                    className="border rounded px-3 py-2 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                    placeholder="Angi totalbudsjett"
                    aria-label="Enter total budget amount"
                    autoFocus
                  />
                </div>
                <button 
                  className="w-full bg-primary-600 dark:bg-primary-700 text-white rounded py-2 mt-2 hover:bg-primary-700 dark:hover:bg-primary-600 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                  aria-label="Lagre budsjett"
                  onClick={() => {
                    if (totalBudget <= 0) {
                      alert('Vennligst angi et gyldig budsjettbeløp');
                      return;
                    }
                    setShowSetupModal(false);
                  }}
                >
                  Start Budsjettering
                </button>
              </div>
            </div>
          )}
      
          {/* App content when setup modal is closed */}
          {!showSetupModal && (
            <>
              {/* Header */}
              <header className="bg-regal-blue dark:bg-regal-blue text-white p-4 shadow-card-light dark:shadow-card-dark transition-colors duration-200">
                <div className="container mx-auto flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Budsjettplanlegger for Teamarrangementer</h1>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm bg-orient dark:bg-orient/80 px-3 py-1 rounded hidden md:block transition-colors duration-200">
                      Totalbudsjett: {formatCurrency(totalBudget)} | 
                      Brukt: {formatCurrency(totals.spent)} | 
                      Rest: {formatCurrency(totals.remaining)}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setActiveView('dashboard')} 
                        className={`p-2 rounded ${activeView === 'dashboard' ? 'bg-orient dark:bg-orient/80' : 'hover:bg-orient dark:hover:bg-orient/80'}`}
                        aria-label="View dashboard"
                        title="View dashboard"
                      >
                        <BarChart2 size={20} />
                      </button>
                      <button 
                        onClick={() => setActiveView('categories')} 
                        className={`p-2 rounded ${activeView === 'categories' ? 'bg-orient dark:bg-orient/80' : 'hover:bg-orient dark:hover:bg-orient/80'}`}
                        aria-label="View categories"
                        title="View categories"
                      >
                        Kategorier
                      </button>
                      <button 
                        onClick={() => setActiveView('expenses')} 
                        className={`p-2 rounded ${activeView === 'expenses' ? 'bg-orient dark:bg-orient/80' : 'hover:bg-orient dark:hover:bg-orient/80'} transition-colors duration-200`}
                      >
                        Utgifter
                      </button>
                      <button 
                        onClick={() => setActiveView('forecast')} 
                        className={`p-2 rounded ${activeView === 'forecast' ? 'bg-orient dark:bg-orient/80' : 'hover:bg-orient dark:hover:bg-orient/80'} transition-colors duration-200`}
                      >
                        Prognose
                      </button>
                    </div>
                  </div>
                </div>
              </header>

          {/* Main Content */}
          <main className="flex-grow container mx-auto px-4 py-0 max-w-[1200px]">
            {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="grid gap-6 md:grid-cols-2 max-w-full">
            {/* Budget Overview Card */}
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 flex flex-col transition-colors duration-200 w-full h-full">
              <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Budsjettoversikt</h2>
              <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
                <span>Totalt budsjett:</span>
                <span>{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
                <span>Fordelt på kategorier:</span>
                <span>{formatCurrency(calculateTotalAllocated())}</span>
              </div>
              <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
                <span>Ufordelt budsjett:</span>
                <span className={calculateUnallocatedBudget() < 0 ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-primary-600 dark:text-primary-400'}>
                  {formatCurrency(calculateUnallocatedBudget())}
                </span>
              </div>
              <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
                <span>Totalt brukt:</span>
                <span>{formatCurrency(totals.spent)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Gjenstående:</span>
                <span className={typeof totals.remaining === 'string' ? (parseFloat(totals.remaining) < 0 ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-success-600 dark:text-success-400') : (totals.remaining < 0 ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-success-600 dark:text-success-400')}>
                  {formatCurrency(typeof totals.remaining === 'string' ? parseFloat(totals.remaining) : totals.remaining)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4 transition-colors duration-200 overflow-hidden" role="progressbar" aria-label={`Budget usage: ${totals.percentUsed}%`}>
                <div 
                  className={`h-4 rounded-full ${parseFloat(totals.percentUsed) > 90 ? 'bg-danger-500 dark:bg-danger-600' : 'bg-primary-600 dark:bg-primary-500'} ${getProgressBarStyle(Math.min(100, parseFloat(totals.percentUsed)))} transition-all duration-300 ease-in-out`}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                {totals.percentUsed}% av budsjettet er brukt
              </div>
              <div className="flex mt-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Oppdater totalt budsjett</label>
                  <div className="flex">
                    <input 
                      type="number" 
                      value={totalBudget}
                      onChange={(event) => setTotalBudget(Number(event.target.value))}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                      title="Totalt budsjett"
                      aria-label="Update total budget amount"
                      placeholder="0"
                    />
                    <button 
                      className="ml-2 bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded hover:bg-primary-700 dark:hover:bg-primary-600 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                      title="Lagre budsjett"
                      aria-label="Save budget"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                </div>
                <div className="ml-4">
                  <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Eksporter data</label>
                  <button 
                    onClick={handleExportData}
                    className="bg-success-600 dark:bg-success-700 text-white px-3 py-1 rounded flex items-center hover:bg-success-700 dark:hover:bg-success-600 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-success-500 dark:focus:ring-success-400 transition-colors duration-200"
                    aria-label="Export budget data"
                    title="Export budget data"
                  >
                    <Download size={16} className="mr-1" /> Eksporter
                  </button>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-card-dark rounded-lg shadow dark:shadow-card-dark p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Fordeling per kategori</h2>
              <div className="h-80 dark:bg-[#2A2A2A] bg-white rounded-xl shadow-lg dark:shadow-slate-900/20 overflow-hidden border border-gray-200 dark:border-slate-800 p-2 transition-all duration-200">
                {/* Custom legend positioned at top */}
                <div className="flex items-center justify-center gap-6 py-2 px-2 text-xs font-medium bg-white/5 dark:bg-[#1e1e1e] rounded border-b border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                    <span className="text-gray-700 dark:text-white">Akkumulerte utgifter</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
                    <span className="text-gray-700 dark:text-white">Gjenstående budsjett</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400 mr-2"></div>
                    <span className="text-gray-700 dark:text-white">Totalt budsjett</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visibleCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="spent"
                      nameKey="name"
                      label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {visibleCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name) => [formatCurrency(value), name]}
                      itemSorter={(item) => item.value !== undefined ? -item.value : 0}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      formatter={(value) => value} /* No abbreviation for tooltip values */
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map(category => (
                  <div key={category.id} className="flex items-center">
                    <div 
                      className="flex items-center cursor-pointer" 
                      onClick={() => toggleCategoryVisibility(category.id)}
                      title={`${category.name}: ${formatCurrency(category.spent)}`}
                    >
                      <div 
                        className={`w-3 h-3 rounded-full mr-2 ${!category.visible ? 'opacity-30' : ''} ${getBackgroundColorStyle(category.color)}`}
                      ></div>
                      <span className={`text-sm max-w-[120px] truncate ${!category.visible ? 'line-through opacity-50' : ''}`}>
                        <span title={category.name}>{category.name}: {formatCurrency(category.spent)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add Expense */}
            <div className="bg-white dark:bg-card-dark rounded-lg shadow dark:shadow-card-dark p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Legg til utgift</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select 
                    value={newExpense.category_id}
                    onChange={(event) => setNewExpense({...newExpense, category_id: event.target.value})}
                    className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                    title="Velg kategori"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beløp</label>
                  <input 
                    type="number" 
                    value={newExpense.amount}
                    onChange={(event) => setNewExpense({...newExpense, amount: Number(event.target.value)})}
                    className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                  <input 
                    type="text" 
                    value={newExpense.description}
                    onChange={(event) => setNewExpense({...newExpense, description: event.target.value})}
                    className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                    placeholder="Beskriv utgiften"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dato</label>
                  <input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(event) => setNewExpense({...newExpense, date: event.target.value})}
                    className="border border-input-border-light dark:border-input-border-dark rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                    aria-label="Expense date"
                    title="Select expense date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frekvens</label>
                  <select 
                    value={newExpense.recurring}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === 'one-time' || value === 'monthly') {
                        setNewExpense({...newExpense, recurring: value});
                      }
                    }}
                    className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                    title="Velg frekvens"
                  >
                    <option value="one-time" key="one-time">Engangs</option>
                    <option value="monthly" key="monthly">Månedlig</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAddExpense}
                    disabled={!newExpense.description || newExpense.amount <= 0}
                    className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-1 rounded w-full disabled:bg-primary-300 dark:disabled:bg-primary-800 hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark"
                  >
                    Legg til utgift
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white dark:bg-card-dark rounded-lg shadow dark:shadow-card-dark p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Siste utgifter</h2>
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-white transition-colors duration-200">Beskrivelse</th>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-white transition-colors duration-200">Beløp</th>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-white transition-colors duration-200">Dato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(expense => {
                      const category = categories.find(c => c.id === expense.category_id);
                      return (
                        <tr key={expense.id} className="border-b">
                          <td className="py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${getBackgroundColorStyle(category?.color || '#ccc')}`}></div>
                              {expense.description}
                              {expense.recurring === 'monthly' && (
                                <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-1 rounded transition-colors duration-200">Månedlig</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">{formatCurrency(expense.amount)}</td>
                          <td className="py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">{new Date(expense.date).toLocaleDateString('nb-NO')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories View */}
        {activeView === 'categories' && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200">
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
              <div className="bg-primary-50 dark:bg-primary-900/30 p-4 mb-6 rounded transition-colors duration-200">
                <h3 className="font-medium mb-3 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Ny kategori</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Navn</label>
                    <input 
                      type="text" 
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                      placeholder="Kategorinavn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Budsjett</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        value={newCategory.budget}
                        onChange={(event) => {
                          const newValue = Number(event.target.value);
                          setNewCategory({
                            ...newCategory, 
                            budget: newValue
                          });
                        }}
                        className={`border border-input-border-light dark:border-input-border-dark rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200 ${
                          calculateUnallocatedBudget() - newCategory.budget < 0 
                            ? 'border-danger-500 dark:border-danger-400' 
                            : ''
                        }`}
                        placeholder="0"
                      />
                      <span className="ml-2 text-xs">
                        {calculateUnallocatedBudget() < 0 
                          ? <span className="text-danger-600 dark:text-danger-400 transition-colors duration-200">Overbudsjettert!</span>
                          : <span className="text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Tilgjengelig: {formatCurrency(calculateUnallocatedBudget())}</span>}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleAddCategory}
                      disabled={!newCategory.name || newCategory.budget <= 0}
                      className="bg-success-600 dark:bg-success-700 text-white px-4 py-1 rounded mr-2 disabled:bg-success-300 dark:disabled:bg-success-800 hover:bg-success-700 dark:hover:bg-success-600 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-success-500 dark:focus:ring-success-400 transition-colors duration-200"
                    >
                      Lagre
                    </button>
                    <button 
                      onClick={() => setIsAddingCategory(false)}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-4 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors duration-200"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Categories Table */}
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Kategori</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Budsjett</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">% av total</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Brukt</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Gjenstående</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Fremgang</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Synlig</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map(category => (
                  <tr key={category.id} className={`border-b dark:border-gray-700 ${!category.visible ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300' : ''}`}>
                    <td className="py-3">
                      <div className="flex items-center" title={category.name}>
                        <div 
                          className={`w-3 h-3 rounded-full mr-2 ${getBackgroundColorStyle(category.color)}`}
                          aria-label={`Color indicator for ${category.name}`}
                        ></div>
                        <span className="hidden md:inline">{category.name}</span>
                        <span className="md:hidden" title={category.name}>{abbreviateText(category.name, 12)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={category.budget}
                          aria-label={`Budget amount for ${category.name}`}
                          title={`Set budget amount for ${category.name}`}
                          onChange={(event) => {
                            const newBudget = Number(event.target.value);
                            setCategories(
                              categories.map(cat => 
                                cat.id === category.id 
                                  ? { ...cat, budget: newBudget } 
                                  : cat
                              )
                            );
                          }}
                          className="border rounded w-24 px-2 py-1 text-sm bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                        />
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {((category.budget / totalBudget) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3">{formatCurrency(category.spent)}</td>
                    <td className={`py-3 ${category.remaining < 0 ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-text-light-primary dark:text-text-dark-primary'} transition-colors duration-200`}>
                      {formatCurrency(category.remaining)}
                    </td>
                    <td className="py-3 w-1/4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            category.spent / category.budget > 0.9 ? 'bg-danger-500 dark:bg-danger-600' : 'bg-primary-600 dark:bg-primary-500'
                          } ${getProgressBarStyle(Math.min(100, (category.spent / category.budget) * 100))}`}
                          aria-label={`${Math.min(100, (category.spent / category.budget) * 100).toFixed(0)}% of budget used`}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleCategoryVisibility(category.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          category.visible 
                            ? 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 hover:bg-success-200 dark:hover:bg-success-900/50' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                        } transition-colors duration-200`}
                        title={`${category.visible ? 'Skjul' : 'Vis'} kategori`}
                      >
                        {category.visible ? 'Ja' : 'Nei'}
                      </button>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 transition-colors duration-200"
                        title="Delete Category"
                        aria-label={`Delete ${category.name} category`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-b dark:border-gray-700 bg-primary-50 dark:bg-primary-900/20 transition-colors duration-200">
                  <td className="py-3 font-bold">Total</td>
                  <td className="py-3 font-bold">{formatCurrency(Number(calculateTotalAllocated()))}</td>
                  <td className="py-3 font-bold">100%</td>
                  <td className="py-3 font-bold">{formatCurrency(totals.spent)}</td>
                  <td className="py-3 font-bold">{formatCurrency(totals.remaining)}</td>
                  <td className="py-3" colSpan={3}>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2 transition-colors duration-200">
                        <div 
                          className={`h-3 rounded-full ${parseFloat(totals.percentUsed) > 90 ? 'bg-danger-500 dark:bg-danger-600' : 'bg-primary-600 dark:bg-primary-500'} ${getProgressBarStyle(Math.min(100, typeof totals.percentUsed === 'string' ? parseFloat(totals.percentUsed) : totals.percentUsed))} transition-all duration-300 ease-in-out`}
                        ></div>
                      </div>
                      <span className="text-sm">{totals.percentUsed}%</span>
                    </div>
                  </td>
                </tr>
                <tr className={`${calculateUnallocatedBudget() < 0 ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300' : 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300'} transition-colors duration-200`}>
                  <td className="py-3 font-medium">Ufordelt budsjett</td>
                  <td className="py-3 font-bold" colSpan={7}>
                    {formatCurrency(Number(calculateUnallocatedBudget()))}
                    {calculateUnallocatedBudget() < 0 && 
                      <span className="ml-2 text-xs text-danger-600 dark:text-danger-400 transition-colors duration-200">
                        Advarsel: Du har fordelt mer enn totalbudsjettet!
                      </span>
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses View */}
        {activeView === 'expenses' && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Administrer utgifter</h2>
              <button 
                onClick={() => setIsAddingExpense(!isAddingExpense)} 
                className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded flex items-center hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                title="Legg til ny utgift"
              >
                <PlusCircle size={16} className="mr-1" /> Legg til utgift
              </button>
            </div>
            
            {/* Add Expense Form */}
            {isAddingExpense && (
              <div className="bg-primary-50 dark:bg-primary-900/30 p-4 mb-6 rounded transition-colors duration-200">
                <h3 className="font-medium mb-3 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Ny utgift</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select 
                      value={newExpense.category_id}
                      onChange={(event) => setNewExpense({...newExpense, category_id: event.target.value})}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                      title="Velg kategori"
                    >
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
                      placeholder="Beskriv utgiften"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Beløp</label>
                    <input 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(event) => setNewExpense({...newExpense, amount: Number(event.target.value)})}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dato</label>
                    <input 
                      type="date" 
                      value={newExpense.date}
                      onChange={(event) => setNewExpense({...newExpense, date: event.target.value})}
                      className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      aria-label="Expense date"
                      title="Select expense date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frekvens</label>
                    <select 
                      value={newExpense.recurring}
                      aria-label="Expense frequency"
                      title="Select expense frequency"
                      onChange={(event) => {
                    const value = event.target.value;
                    if (value === 'one-time' || value === 'monthly') {
                      setNewExpense({...newExpense, recurring: value as 'one-time' | 'monthly'});
                    }
                  }}
                      className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                    >
                      <option value="one-time">Engangs</option>
                      <option value="monthly">Månedlig</option>
                    </select>
                  </div>
                </div>
                <div className="flex mt-4">
                  <button 
                    onClick={handleAddExpense}
                    disabled={!newExpense.description || newExpense.amount <= 0}
                    className="bg-success-600 dark:bg-success-700 text-white px-4 py-1 rounded mr-2 disabled:bg-success-300 dark:disabled:bg-success-800 hover:bg-success-700 dark:hover:bg-success-600 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-success-500 dark:focus:ring-success-400 transition-colors duration-200"
                  >
                    Lagre utgift
                  </button>
                  <button 
                    onClick={() => setIsAddingExpense(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors duration-200"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}
            
            {/* Expenses Table */}
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Beskrivelse</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Kategori</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Beløp</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Dato</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Frekvens</th>
                  <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
                  const category = categories.find(c => c.id === expense.category_id);
                  return (
                    <tr key={expense.id} className="border-b">
                      <td className="py-3" title={expense.description}>
                        <span title={expense.description}>{abbreviateText(expense.description, 25)}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center" title={category?.name || 'Ukjent kategori'}>
                          <div className={`w-3 h-3 rounded-full mr-2 ${getBackgroundColorStyle(category?.color || '#ccc')}`}></div>
                          <span title={category?.name || 'Ukjent kategori'}>{abbreviateText(category?.name || 'Ukjent kategori', 16)}</span>
                        </div>
                      </td>
                      <td className="py-3">{formatCurrency(expense.amount)}</td>
                      <td className="py-3">{new Date(expense.date).toLocaleDateString('nb-NO')}</td>
                      <td className="py-3">
                        {expense.recurring === 'monthly' ? (
                          <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded transition-colors duration-200">Månedlig</span>
                        ) : (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-2 py-1 rounded transition-colors duration-200">Engangs</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 transition-colors duration-200"
                          title="Slett utgift"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Forecast View */}
        {activeView === 'forecast' && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-6 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Årlig budsjettprognose</h2>
            
            {/* Cumulative Spending Chart */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Akkumulerte utgifter vs budsjett</h3>
                  <div className="ml-2 inline-flex items-center bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs font-medium text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">Prognose</div>
                </div>
                <div className="p-1 px-3 bg-gray-100 dark:bg-gray-800/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50 flex items-center">
                  <span className="mr-1 text-gray-500 dark:text-white">År:</span>
                  {currentYear}
                </div>
              </div>
              <div className="h-80 dark:bg-[#2A2A2A] bg-white rounded-xl shadow-lg dark:shadow-slate-900/20 overflow-hidden border border-gray-200 dark:border-slate-800 p-2 transition-all duration-200">
                {/* Custom legend positioned at top */}
                <div className="flex items-center justify-center gap-6 py-2 px-2 text-xs font-medium bg-white/5 dark:bg-[#1e1e1e] rounded border-b border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                    <span className="text-gray-700 dark:text-white">Akkumulerte utgifter</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
                    <span className="text-gray-700 dark:text-white">Gjenstående budsjett</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400 mr-2"></div>
                    <span className="text-gray-700 dark:text-white">Totalt budsjett</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecast}
                    margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                    className="dark:bg-transparent rounded-lg overflow-hidden"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-300)" className="dark:!opacity-15" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff" 
                      tick={{ fill: '#ffffff', stroke: 'none' }} 
                      tickLine={{ stroke: '#ffffff' }} 
                      axisLine={{ stroke: '#ffffff' }}
                      style={{ color: '#ffffff', fill: '#ffffff' }}
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#ffffff" 
                      tick={{ fill: '#ffffff', stroke: 'none' }} 
                      tickLine={{ stroke: '#ffffff' }} 
                      axisLine={{ stroke: '#ffffff' }}
                      style={{ color: '#ffffff', fill: '#ffffff' }}
                      tickFormatter={(value) => formatCurrency(value).split(' ')[0]}
                      tickMargin={5}
                      width={60}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-card-light)', 
                        color: 'var(--color-text-light-primary)', 
                        borderColor: 'var(--color-primary-200)', 
                        borderRadius: '0.375rem',
                        filter: 'var(--tooltip-filter)'
                      }} 
                      itemStyle={{ color: 'var(--color-text-light-primary)' }}
                      labelStyle={{ color: 'var(--color-text-light-secondary)' }}
                      formatter={(value) => {
                      if (Array.isArray(value)) {
                        return formatCurrency(typeof value[0] === 'string' ? parseFloat(value[0]) : value[0]);
                      }
                      return formatCurrency(typeof value === 'string' ? parseFloat(value) : value);
                    }} />
                    {/* Hidden legend - using custom one at top */}
                    <Legend 
                      height={0}
                      wrapperStyle={{
                        visibility: 'hidden',
                        height: 0,
                        width: 0,
                        margin: 0,
                        padding: 0
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      name="Akkumulerte utgifter" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      className="dark:!stroke-blue-400"
                      activeDot={{ r: 8, fill: '#3b82f6', className: 'dark:!fill-blue-400', stroke: '#fff', strokeWidth: 2 }}
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 1, stroke: '#fff', className: 'dark:!fill-blue-400' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="remaining" 
                      name="Gjenstående budsjett" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      className="dark:!stroke-green-400"
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#22c55e', strokeWidth: 1, stroke: '#fff', className: 'dark:!fill-green-400' }}
                    />
                    {/* Budget Reference Line */}
                    <Line 
                      type="monotone" 
                      dataKey={() => totalBudget} 
                      name="Totalt budsjett" 
                      stroke="#eab308" 
                      strokeWidth={3}
                      className="dark:!stroke-yellow-400"
                      strokeDasharray="5 5"
                      dot={{ r: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Monthly Breakdown Chart */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Månedlige utgifter per kategori</h3>
                <div className="p-1 px-3 bg-gray-100 dark:bg-gray-800/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50">Fordeling</div>
              </div>
              <div className="h-96 dark:bg-[#2A2A2A] bg-white rounded-xl shadow-lg dark:shadow-slate-900/20 overflow-hidden border border-gray-200 dark:border-slate-800 p-2 transition-all duration-200">
                {/* Custom legend positioned at top */}
                <div className="flex items-center justify-center flex-wrap gap-4 py-2 mb-1 px-2 text-xs font-medium bg-white/5 dark:bg-[#1e1e1e] rounded border-b border-slate-200 dark:border-slate-800/50">                  
                  {categories
                    .filter(category => category.visible)
                    .map(category => (
                      <div key={category.id} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getBackgroundColorStyle(category.color)}`}></div>
                        <span className="text-gray-700 dark:text-white" title={category.name}>{abbreviateText(category.name, 14)}</span>
                      </div>
                    ))
                  }
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forecast}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    className="dark:bg-transparent rounded-lg overflow-hidden"
                    barGap={2}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-300)" className="dark:!opacity-15" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff" 
                      tick={{ fill: '#ffffff', stroke: 'none' }} 
                      tickLine={{ stroke: '#ffffff' }} 
                      axisLine={{ stroke: '#ffffff' }}
                      style={{ color: '#ffffff', fill: '#ffffff' }}
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#ffffff" 
                      tick={{ fill: '#ffffff', stroke: 'none' }} 
                      tickLine={{ stroke: '#ffffff' }} 
                      axisLine={{ stroke: '#ffffff' }}
                      style={{ color: '#ffffff', fill: '#ffffff' }}
                      tickFormatter={(value) => formatCurrency(value).split(' ')[0]}
                      tickMargin={5}
                      width={60}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-card-light)', 
                        color: 'var(--color-text-light-primary)', 
                        borderColor: 'var(--color-primary-200)', 
                        borderRadius: '0.375rem',
                        filter: 'var(--tooltip-filter)'
                      }} 
                      itemStyle={{ color: 'var(--color-text-light-primary)' }}
                      labelStyle={{ color: 'var(--color-text-light-secondary)' }}
                      formatter={(value) => {
                      if (Array.isArray(value)) {
                        return formatCurrency(typeof value[0] === 'string' ? parseFloat(value[0]) : value[0]);
                      }
                      return formatCurrency(typeof value === 'string' ? parseFloat(value) : value);
                    }} />
                    {/* Hidden legend - using custom one at top */}
                    <Legend 
                      height={0}
                      wrapperStyle={{
                        visibility: 'hidden',
                        height: 0,
                        width: 0,
                        margin: 0,
                        padding: 0
                      }}
                    />
                    {categories
                      .filter(category => category.visible)
                      .map(category => (
                        <Bar 
                          key={category.id} 
                          dataKey={category.name} 
                          stackId="a" 
                          fill={category.color} 
                        />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Monthly Detailed Table */}
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200">
              <h3 className="text-lg font-medium mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Månedlige budsjettdetaljer</h3>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Kategorier som vises:</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategoryVisibility(category.id)}
                      className={`px-2 py-1 text-xs rounded-full flex items-center ${
                        category.visible 
                          ? 'bg-primary-100 text-primary-800 border border-primary-300 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800' 
                          : 'bg-gray-100 text-gray-500 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700'
                      } transition-colors`}
                    >
                      <div 
                        className={`w-2 h-2 rounded-full mr-1 ${getBackgroundColorStyle(category.color)}`}
                      ></div>
                      <span title={category.name}>{abbreviateText(category.name, 12)}</span>
                      {!category.visible && <span className="ml-1">❌</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Måned</th>
                      {categories.filter(c => c.visible).map(category => (
                        <th key={category.id} className="text-left py-2" title={category.name}>
                          <span title={category.name}>{abbreviateText(category.name, 12)}</span>
                        </th>
                      ))}
                      <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Total</th>
                      <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Akkumulert</th>
                      <th className="text-left py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Gjenstående</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((month, index) => (
                      <tr key={index} className={`border-b dark:border-gray-700 ${currentMonth === index ? 'bg-primary-50 dark:bg-primary-900/20' : ''} transition-colors duration-200`}>
                        <td className="py-2 font-medium text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">{month.name}</td>
                        {categories.filter(c => c.visible).map(category => (
                          <td key={category.id} className="py-2">
                            {(month[category.name] ?? 0) > 0 ? formatCurrency(month[category.name] ?? 0) : '-'}
                          </td>
                        ))}
                        <td className="py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">{formatCurrency(month.total ?? 0)}</td>
                        <td className="py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">{formatCurrency(month.cumulative ?? 0)}</td>
                        <td className={`py-2 ${(month.remaining ?? 0) < 0 ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-text-light-primary dark:text-text-dark-primary'} transition-colors duration-200`}>
                          {formatCurrency(month.remaining ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t mt-auto w-full">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-600 text-center">
          Budsjettplanlegger for Teamarrangementer — {currentYear}
          <button 
            onClick={() => setShowSetupModal(true)} 
            className="ml-4 text-blue-600 hover:text-blue-800 underline"
          >
            Endre totalbudsjett
          </button>
        </div>
      </footer>
          </>
          )}
          {/* Delete Category Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div 
                className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center mb-4 text-red-500">
                  <AlertTriangle className="mr-2" size={24} />
                  <h3 className="text-xl font-bold">Delete Category</h3>
                </div>
                <p className="text-gray-700 dark:text-white mb-6">
                  Are you sure you want to delete this category? This action cannot be undone and will remove all expenses associated with this category.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600 font-medium disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                    Delete Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
