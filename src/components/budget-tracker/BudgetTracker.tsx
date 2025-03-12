import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CategoryWithSpent, ForecastData, ViewType, NewCategoryData, NewExpenseData } from './BudgetTypes';
import { calculateSpentPerCategory, calculateTotals } from './BudgetCalculations';
import { formatCurrency } from './BudgetCalculations';
import { Expense } from '@/lib/supabase';

// Import view components
import DashboardView from './DashboardView';
import CategoriesView from './CategoriesView';
import ExpensesView from './ExpensesView';
import ForecastView from './ForecastView';
import SetupModal from './SetupModal';

// Define months for use in the app (in Norwegian)
const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

const BudgetTracker: React.FC = () => {
  // Get budget context
  const { selectedBudget, fetchBudgetDetails, createCategory, createExpense, deleteCategory, deleteExpense, updateBudget, updateCategory } = useBudget();
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
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  
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
  
  // Generate forecast when categories or expenses change
  useEffect(() => {
    if (categories.length > 0) {
      setForecast(generateForecast());
    }
  }, [categories, expenses]);
  
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
      
      // Handle one-time expenses
      if (expense.recurring === 'one-time') {
        // Only include if it's for the current year
        if (expenseYear === currentYear) {
          monthlyData[expenseMonth][category.name] = (monthlyData[expenseMonth][category.name] || 0) + expense.amount;
          monthlyData[expenseMonth].total = (monthlyData[expenseMonth].total || 0) + expense.amount;
        }
      } 
      // Handle monthly recurring expenses
      else if (expense.recurring === 'monthly') {
        // Apply to each month from expense date to end of year
        for (let i = expenseMonth; i < 12; i++) {
          monthlyData[i][category.name] = (monthlyData[i][category.name] || 0) + expense.amount;
          monthlyData[i].total = (monthlyData[i].total || 0) + expense.amount;
        }
      }
    });
    
    // Calculate cumulative totals
    let cumulativeTotal = 0;
    const totalBudgetForYear = totalBudget;
    
    monthlyData.forEach(month => {
      cumulativeTotal += month.total;
      month.cumulative = cumulativeTotal;
      month.remaining = totalBudgetForYear - cumulativeTotal;
    });
    
    return monthlyData;
  };
  
  // Handle adding a new category
  const handleAddCategory = async (newCategoryData: NewCategoryData) => {
    if (!selectedBudget) return;
    
    try {
      const newCategory = await createCategory({
        budget_id: selectedBudget.id,
        name: newCategoryData.name,
        budget: newCategoryData.budget,
        color: newCategoryData.color,
        visible: true
      });
      
      if (newCategory) {
        setCategories([...categories, newCategory]);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };
  
  // Handle updating an existing category
  const handleUpdateCategory = async (categoryId: string, updatedData: Partial<CategoryWithSpent>) => {
    if (!selectedBudget) return;
    
    try {
      const updatedCategory = await updateCategory({
        id: categoryId,
        ...updatedData
      });
      
      if (updatedCategory) {
        // Update the category in the local state
        setCategories(categories.map(cat => 
          cat.id === categoryId ? { ...cat, ...updatedData } : cat
        ));
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };
  
  // Handle adding a new expense
  const handleAddExpense = async (newExpenseData: NewExpenseData) => {
    if (!selectedBudget) return;
    
    try {
      const newExpense = await createExpense({
        budget_id: selectedBudget.id,
        category_id: newExpenseData.category_id,
        description: newExpenseData.description,
        amount: newExpenseData.amount,
        date: newExpenseData.date,
        recurring: newExpenseData.recurring
      });
      
      if (newExpense) {
        setExpenses([...expenses, newExpense]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  // Handle deleting an expense
  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };
  
  // Handle saving the total budget
  const handleSetupSave = async (newBudget: number) => {
    if (!selectedBudget) return;
    
    try {
      await updateBudget({ id: selectedBudget.id, total_amount: newBudget });
      setTotalBudget(newBudget);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
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
  const categoryData = calculateSpentPerCategory(categories, expenses);
  const visibleCategoryData = categoryData.filter(category => category.visible);
  const totals = calculateTotals(visibleCategoryData);
  
  // Return JSX structure
  return (
    <div className="h-full" data-id="root-container">
      {!selectedBudget ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary transition-colors duration-200" data-id="app-container">
          {/* Budget Setup Modal */}
          <SetupModal
            isOpen={showSetupModal}
            onClose={() => setShowSetupModal(false)}
            onSave={handleSetupSave}
            initialBudget={totalBudget}
          />

          {/* App content when setup modal is closed */}
          {!showSetupModal && (
            <div className="w-full max-w-7xl mx-auto" data-id="app-width-container">
              {/* Header */}
              <header className="bg-regal-blue dark:bg-regal-blue text-white py-5 shadow-lg sticky top-0 z-10 mb-6 transition-colors duration-200 w-full rounded-lg" data-id="main-header">
                <div className="flex justify-between items-center px-6" data-id="header-content">
                  <h1 className="text-2xl font-bold" data-id="app-title">Budsjett</h1>
                  <div className="flex items-center space-x-4" data-id="header-controls">
                    <div className="text-sm bg-orient dark:bg-orient/80 px-4 py-2 rounded hidden md:block transition-colors duration-200 shadow-sm" data-id="budget-summary">
                      Totalbudsjett: {formatCurrency(totalBudget)} | 
                      Brukt: {formatCurrency(totals.spent)} | 
                      Rest: {formatCurrency(totals.remaining)}
                    </div>
                    <div className="flex space-x-3" data-id="nav-buttons">
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
              <main className="flex-grow bg-background-light dark:bg-background-dark transition-colors duration-200 w-full space-y-6" data-id="main-content">
                  {/* Dashboard View */}
                  {activeView === 'dashboard' && (
                    <DashboardView 
                      totalBudget={totalBudget}
                      setTotalBudget={setTotalBudget}
                      categories={visibleCategoryData}
                      totals={totals}
                      handleExportData={handleExportData}
                      expenses={expenses}
                      onAddExpense={handleAddExpense}
                      onDeleteExpense={handleDeleteExpense}
                    />
                  )}

                  {/* Categories View */}
                  {activeView === 'categories' && (
                    <CategoriesView 
                      categories={categoryData}
                      totalBudget={totalBudget}
                      totals={totals}
                      onAddCategory={handleAddCategory}
                      onDeleteCategory={handleDeleteCategory}
                      onUpdateCategory={handleUpdateCategory}
                    />
                  )}

                  {/* Expenses View */}
                  {activeView === 'expenses' && (
                    <ExpensesView 
                      categories={categories}
                      expenses={expenses}
                      onAddExpense={handleAddExpense}
                      onDeleteExpense={handleDeleteExpense}
                    />
                  )}

                  {/* Forecast View */}
                  {activeView === 'forecast' && (
                    <ForecastView 
                      categories={categories}
                      forecast={forecast}
                      totalBudget={totalBudget}
                    />
                  )}
              </main>

              {/* Footer */}
              <footer className="bg-gray-100 border-t mt-auto w-full rounded-lg">
                <div className="py-4 text-sm text-gray-600 text-center">
                  Budsjett — {currentYear}
                  <button 
                    onClick={() => setShowSetupModal(true)} 
                    className="ml-4 text-blue-600 hover:text-blue-800 underline"
                  >
                    Endre totalbudsjett
                  </button>
                </div>
              </footer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
