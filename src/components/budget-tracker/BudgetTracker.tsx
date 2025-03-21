import React, { useState, useEffect } from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CategoryWithSpent, ForecastData, NewCategoryData, NewExpenseData } from './BudgetTypes';
import { calculateSpentPerCategory, calculateTotals } from './BudgetCalculations';
import { formatCurrency } from './BudgetCalculations';
import { Expense } from '@/lib/supabase';

// Import view components
import DashboardView from './DashboardView';
import CategoriesView from './CategoriesView';
import ExpensesView from './ExpensesView';
import ForecastView from './ForecastView';
import SetupModal from './SetupModal';
import TabsContainer from './TabsContainer';
import BudgetHeader from './BudgetHeader';
import AddCategoryModal from './AddCategoryModal';
import AddExpenseModal from './AddExpenseModal';
import FloatingActionButtons from './FloatingActionButtons';

// Define months for use in the app (in Norwegian)
const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

const BudgetTracker: React.FC = () => {
  // Get budget context
  const { selectedBudget, fetchBudgetDetails, createCategory, createExpense, deleteCategory, deleteExpense, updateBudget, updateCategory, updateExpense } = useBudget();
  // Get theme context
  const { theme } = useTheme();
  
  // Control modal visibility explicitly
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  
  // Detect if we're on mobile using window width
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };
    
    // Check on mount
    checkIfMobile();
    
    // Set up resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // State management
  const [totalBudget, setTotalBudget] = useState(0);
  const [categories, setCategories] = useState<CategoryWithSpent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'forecast'>('overview');
  
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
      
      // Determine the expense amount to use based on whether it's actual or planned
      // For actual expenses, use the actual amount
      // For planned expenses, use the budgeted amount
      const expenseAmount = expense.is_actual ? expense.amount : expense.budgeted_amount;
      
      // Handle one-time expenses
      if (expense.recurring === 'one-time') {
        // Only include if it's for the current year
        if (expenseYear === currentYear) {
          monthlyData[expenseMonth][category.name] = (monthlyData[expenseMonth][category.name] || 0) + expenseAmount;
          monthlyData[expenseMonth].total = (monthlyData[expenseMonth].total || 0) + expenseAmount;
        }
      } 
      // Handle monthly recurring expenses
      else if (expense.recurring === 'monthly') {
        // Apply to each month from expense date to end of year
        for (let i = expenseMonth; i < 12; i++) {
          monthlyData[i][category.name] = (monthlyData[i][category.name] || 0) + expenseAmount;
          monthlyData[i].total = (monthlyData[i].total || 0) + expenseAmount;
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
      // Determine if this is an actual expense or a budgeted one
      const isActual = newExpenseData.is_actual !== undefined ? newExpenseData.is_actual : true;
      
      const newExpense = await createExpense({
        budget_id: selectedBudget.id,
        category_id: newExpenseData.category_id,
        description: newExpenseData.description,
        // If it's an actual expense, use the actual amount. Otherwise set to 0
        amount: isActual ? newExpenseData.amount : 0,
        // For planned expenses, use budgeted_amount. For actual expenses with no budgeted_amount, use amount as fallback
        budgeted_amount: isActual ? (newExpenseData.budgeted_amount || newExpenseData.amount || 0) : (newExpenseData.budgeted_amount || 0),
        date: newExpenseData.date,
        recurring: newExpenseData.recurring,
        is_actual: isActual
      });
      
      if (newExpense) {
        setExpenses([...expenses, newExpense]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
  // Handle updating an existing expense
  const handleUpdateExpense = async (expenseId: string, updatedData: Partial<Expense>) => {
    if (!selectedBudget) return;
    
    try {
      // Make sure both actual and budgeted amounts are properly handled
      const dataToUpdate = {
        ...updatedData,
        // If this is an actual expense, ensure amount is set correctly
        amount: updatedData.is_actual ? (updatedData.amount ?? 0) : 0,
        // Ensure budgeted_amount is set correctly - default to 0 if both are undefined
        budgeted_amount: updatedData.budgeted_amount ?? updatedData.amount ?? 0,
      };
      
      const updatedExpense = await updateExpense({
        id: expenseId,
        ...dataToUpdate
      });
      
      if (updatedExpense) {
        // Update the expense in the local state
        setExpenses(expenses.map(exp => 
          exp.id === expenseId ? { ...exp, ...dataToUpdate } : exp
        ));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
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
  const totals = calculateTotals(totalBudget, visibleCategoryData);
  
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
              {/* Consolidated Budget Header */}
              {selectedBudget && (
                <BudgetHeader 
                  budgetName={selectedBudget.name}
                  totalBudget={totalBudget}
                  totals={totals}
                  budget={{
                    ...selectedBudget,
                    totalBudget: totalBudget,
                    categories: categories,
                    expenses: expenses,
                    forecast: forecast
                  }}
                  onAddCategory={() => setShowAddCategoryModal(true)}
                  onAddExpense={() => setShowAddExpenseModal(true)}
                />
              )}

              {/* Main Content with Tabs */}
              <main className="flex-grow bg-background-light dark:bg-background-dark transition-colors duration-200 w-full space-y-6" data-id="main-content">
                <TabsContainer activeTab={activeTab} onTabChange={setActiveTab}>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
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

                  {/* Administrer Tab - Combined Categories and Expenses */}
                  {activeTab === 'manage' && (
                    <div className="space-y-8">
                      {/* Categories Section */}
                      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-space-lg transition-colors duration-200 w-full">

                        <CategoriesView 
                          categories={categoryData}
                          totalBudget={totalBudget}
                          totals={totals}
                          onAddCategory={handleAddCategory}
                          onDeleteCategory={handleDeleteCategory}
                          onUpdateCategory={handleUpdateCategory}
                        />
                      </div>
                      
                      {/* Expenses Section */}
                      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-space-lg transition-colors duration-200 w-full">

                        <ExpensesView 
                          categories={categories}
                          expenses={expenses}
                          onAddExpense={handleAddExpense}
                          onDeleteExpense={handleDeleteExpense}
                          onUpdateExpense={handleUpdateExpense}
                        />
                      </div>
                    </div>
                  )}

                  {/* Forecast Tab */}
                  {activeTab === 'forecast' && (
                    <ForecastView 
                      categories={categories}
                      forecast={forecast}
                      totalBudget={totalBudget}
                    />
                  )}
                </TabsContainer>
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
      
      {/* Floating Action Buttons */}
      <FloatingActionButtons
        onAddCategory={() => setShowAddCategoryModal(true)}
        onAddExpense={() => setShowAddExpenseModal(true)}
      />
      
      {/* Add Category Modal */}
      <AddCategoryModal 
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onAddCategory={handleAddCategory}
        isMobile={isMobile}
      />
      
      {/* Add Expense Modal */}
      <AddExpenseModal 
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAddExpense={handleAddExpense}
        categories={categoryData}
        isMobile={isMobile}
      />
    </div>
  );
};

export default BudgetTracker;
