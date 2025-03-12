import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PlusCircle, Trash2, Save, Download, Edit, Calendar, DollarSign, BarChart2 } from 'lucide-react';

// Define months for use in the app (in Norwegian)
const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const currentMonth = new Date().getMonth();

// Get current year
const currentYear = new Date().getFullYear();

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#52BF90', '#2C786C', '#F8333C'];

// Abbreviate text if too long
const abbreviateText = (text, maxLength = 14) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

const BudgetTracker = () => {
  // Control modal visibility explicitly
  const [showSetupModal, setShowSetupModal] = useState(false);
  // State management
  const [totalBudget, setTotalBudget] = useState(16000); // Default budget
  const [categories, setCategories] = useState([
    { id: 1, name: 'Mat / Drikke Dagligvare', color: COLORS[0], budget: 4000, visible: true },
    { id: 2, name: 'Vinmonopolet', color: COLORS[1], budget: 2000, visible: true },
    { id: 3, name: 'Holmenkollstafetten', color: COLORS[2], budget: 1500, visible: true },
    { id: 4, name: 'Opplevelser', color: COLORS[3], budget: 2000, visible: true },
    { id: 5, name: 'Leie av lokaler', color: COLORS[4], budget: 3000, visible: true },
    { id: 6, name: 'Bonger', color: COLORS[5], budget: 1500, visible: true },
    { id: 7, name: 'Foredragsholdere', color: COLORS[6], budget: 2000, visible: true }
  ]);
  
  const [expenses, setExpenses] = useState([
    { id: 1, category: 1, description: 'Lunch med teamet', amount: 1500, date: '2025-03-05', recurring: 'monthly' },
    { id: 2, category: 5, description: 'Booking av møterom', amount: 2500, date: '2025-04-15', recurring: 'one-time' },
    { id: 3, category: 7, description: 'Honorar foredragsholder', amount: 4000, date: '2025-05-20', recurring: 'one-time' },
    { id: 4, category: 2, description: 'Vin til sommerfest', amount: 3500, date: '2025-06-10', recurring: 'one-time' }
  ]);
  
  const [newCategory, setNewCategory] = useState({ name: '', budget: 0, color: COLORS[5] });
  const [newExpense, setNewExpense] = useState({
    category: 1,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time'
  });
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [forecast, setForecast] = useState([]);

  // Toggle category visibility
  const toggleCategoryVisibility = (id) => {
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
        .filter(expense => expense.category === category.id)
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
    const monthlyData = months.map((month, index) => {
      // Initial data structure for this month
      const monthData = {
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
      const category = categories.find(c => c.id === expense.category);
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
      .filter(expense => visibleCategories.includes(expense.category))
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
  const handleAddCategory = () => {
    if (newCategory.name && newCategory.budget > 0) {
      const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      
      // Optional: Check if adding this category would exceed total budget
      const wouldExceedBudget = calculateUnallocatedBudget() - newCategory.budget < 0;
      
      // You could either prevent creation or just warn the user
      if (wouldExceedBudget) {
        if (!window.confirm('Dette vil overskride totalbudsjettet. Vil du fortsette?')) {
          return;
        }
      }
      
      setCategories([...categories, { ...newCategory, id: newId, color: COLORS[newId % COLORS.length], visible: true }]);
      setNewCategory({ name: '', budget: 0 });
      setIsAddingCategory(false);
    }
  };

  // Add new expense
  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount > 0) {
      const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
      setExpenses([...expenses, { ...newExpense, id: newId }]);
      setNewExpense({
        category: 1,
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        recurring: 'one-time'
      });
      setIsAddingExpense(false);
    }
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Delete category (and related expenses)
  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
    setExpenses(expenses.filter(expense => expense.category !== id));
  };

  // Update forecasts when data changes
  useEffect(() => {
    generateForecast();
  }, [expenses, categories, totalBudget]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate total budget allocated to categories
  const calculateTotalAllocated = () => {
    return categories.reduce((sum, category) => sum + category.budget, 0);
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Initial Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Oppsett av budsjett</h2>
            <p className="mb-4">Velkommen til budsjettplanleggeren! Vennligst sett opp ditt totalbudsjett for å komme i gang.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Totalbudsjett for {currentYear}</label>
              <input 
                type="number" 
                value={totalBudget}
                onChange={(event) => setTotalBudget(Number(event.target.value))}
                className="border rounded px-3 py-2 w-full"
                placeholder="Angi totalbudsjett"
                autoFocus
              />
            </div>
            <button 
              onClick={() => {
                if (totalBudget <= 0) {
                  alert('Vennligst angi et gyldig budsjettbeløp');
                  return;
                }
                setShowSetupModal(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
              Start Budsjettering
            </button>
          </div>
        </div>
      )}
      
      {/* Only show app content if setup modal is closed */}
      {!showSetupModal && (
        <>
          {/* Header */}
          <header className="bg-blue-600 text-white p-4 shadow">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Budsjettplanlegger for Teamarrangementer</h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm bg-blue-800 px-3 py-1 rounded hidden md:block">
                  Totalbudsjett: {formatCurrency(totalBudget)} | 
                  Brukt: {formatCurrency(totals.spent)} | 
                  Rest: {formatCurrency(totals.remaining)}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveView('dashboard')} 
                    className={`p-2 rounded ${activeView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    <BarChart2 size={20} />
                  </button>
                  <button 
                    onClick={() => setActiveView('categories')} 
                    className={`p-2 rounded ${activeView === 'categories' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    Kategorier
                  </button>
                  <button 
                    onClick={() => setActiveView('expenses')} 
                    className={`p-2 rounded ${activeView === 'expenses' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    Utgifter
                  </button>
                  <button 
                    onClick={() => setActiveView('forecast')} 
                    className={`p-2 rounded ${activeView === 'forecast' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    Prognose
                  </button>
                </div>
              </div>
            </div>
          </header>

      {/* Main Content */}
      {!showSetupModal && (
        <main className="flex-grow container mx-auto p-4">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Budget Overview Card */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Budsjettoversikt</h2>
              <div className="flex justify-between mb-2">
                <span>Totalt budsjett:</span>
                <span>{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Fordelt på kategorier:</span>
                <span>{formatCurrency(calculateTotalAllocated())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Ufordelt budsjett:</span>
                <span className={calculateUnallocatedBudget() < 0 ? 'text-red-600 font-bold' : 'text-blue-600'}>
                  {formatCurrency(calculateUnallocatedBudget())}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Totalt brukt:</span>
                <span>{formatCurrency(totals.spent)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Gjenstående:</span>
                <span className={totals.remaining < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                  {formatCurrency(totals.remaining)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div 
                  className={`h-4 rounded-full ${totals.percentUsed > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
                  style={{ width: `${Math.min(100, totals.percentUsed)}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm">
                {totals.percentUsed}% av budsjettet er brukt
              </div>
              <div className="flex mt-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Oppdater totalt budsjett</label>
                  <div className="flex">
                    <input 
                      type="number" 
                      value={totalBudget}
                      onChange={(event) => setTotalBudget(Number(event.target.value))}
                      className="border rounded px-2 py-1 w-full"
                    />
                    <button 
                      className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                </div>
                <div className="ml-4">
                  <label className="block text-sm font-medium mb-1">Eksporter data</label>
                  <button 
                    onClick={handleExportData}
                    className="bg-green-600 text-white px-3 py-1 rounded flex items-center"
                  >
                    <Download size={16} className="mr-1" /> Eksporter
                  </button>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Fordeling per kategori</h2>
              <div className="h-64">
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
                      formatter={(value, name) => [formatCurrency(value), name]}
                      itemSorter={(item) => -item.value}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      formatter={(value) => abbreviateText(value, 12)} 
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
                        className={`w-3 h-3 rounded-full mr-2 ${!category.visible ? 'opacity-30' : ''}`} 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className={`text-sm max-w-[120px] truncate ${!category.visible ? 'line-through opacity-50' : ''}`}>
                        {abbreviateText(category.name, 10)}: {formatCurrency(category.spent)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add Expense */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Legg til utgift</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select 
                    value={newExpense.category}
                    onChange={(event) => setNewExpense({...newExpense, category: Number(event.target.value)})}
                    className="border rounded px-2 py-1 w-full"
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
                    className="border rounded px-2 py-1 w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                  <input 
                    type="text" 
                    value={newExpense.description}
                    onChange={(event) => setNewExpense({...newExpense, description: event.target.value})}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Beskriv utgiften"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dato</label>
                  <input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(event) => setNewExpense({...newExpense, date: event.target.value})}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frekvens</label>
                  <select 
                    value={newExpense.recurring}
                    onChange={(event) => setNewExpense({...newExpense, recurring: event.target.value})}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="one-time">Engangs</option>
                    <option value="monthly">Månedlig</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAddExpense}
                    disabled={!newExpense.description || newExpense.amount <= 0}
                    className="bg-blue-600 text-white px-4 py-1 rounded w-full disabled:bg-blue-300"
                  >
                    Legg til utgift
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Siste utgifter</h2>
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500">Beskrivelse</th>
                      <th className="text-left text-sm font-medium text-gray-500">Beløp</th>
                      <th className="text-left text-sm font-medium text-gray-500">Dato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(expense => {
                      const category = categories.find(c => c.id === expense.category);
                      return (
                        <tr key={expense.id} className="border-b">
                          <td className="py-2">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: category?.color }}></div>
                              {expense.description}
                              {expense.recurring === 'monthly' && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Månedlig</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2">{formatCurrency(expense.amount)}</td>
                          <td className="py-2">{new Date(expense.date).toLocaleDateString('nb-NO')}</td>
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Administrer kategorier</h2>
              <button 
                onClick={() => setIsAddingCategory(!isAddingCategory)} 
                className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
              >
                <PlusCircle size={16} className="mr-1" /> Legg til kategori
              </button>
            </div>
            
            {/* Add Category Form */}
            {isAddingCategory && (
              <div className="bg-blue-50 p-4 mb-6 rounded">
                <h3 className="font-medium mb-3">Ny kategori</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Navn</label>
                    <input 
                      type="text" 
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Kategorinavn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Budsjett</label>
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
                        className={`border rounded px-2 py-1 w-full ${
                          calculateUnallocatedBudget() - newCategory.budget < 0 
                            ? 'border-red-500' 
                            : ''
                        }`}
                        placeholder="0"
                      />
                      <span className="ml-2 text-xs">
                        {calculateUnallocatedBudget() < 0 
                          ? <span className="text-red-500">Overbudsjettert!</span>
                          : <span>Tilgjengelig: {formatCurrency(calculateUnallocatedBudget())}</span>}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleAddCategory}
                      disabled={!newCategory.name || newCategory.budget <= 0}
                      className="bg-green-600 text-white px-4 py-1 rounded mr-2 disabled:bg-green-300"
                    >
                      Lagre
                    </button>
                    <button 
                      onClick={() => setIsAddingCategory(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-1 rounded"
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
                  <th className="text-left py-2">Kategori</th>
                  <th className="text-left py-2">Budsjett</th>
                  <th className="text-left py-2">% av total</th>
                  <th className="text-left py-2">Brukt</th>
                  <th className="text-left py-2">Gjenstående</th>
                  <th className="text-left py-2">Fremgang</th>
                  <th className="text-left py-2">Synlig</th>
                  <th className="text-left py-2">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map(category => (
                  <tr key={category.id} className={`border-b ${!category.visible ? 'bg-gray-50 text-gray-500' : ''}`}>
                    <td className="py-3">
                      <div className="flex items-center" title={category.name}>
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                        <span className="hidden md:inline">{category.name}</span>
                        <span className="md:hidden">{abbreviateText(category.name, 10)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={category.budget}
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
                          className="border rounded w-24 px-2 py-1 text-sm"
                        />
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {((category.budget / totalBudget) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3">{formatCurrency(category.spent)}</td>
                    <td className={`py-3 ${category.remaining < 0 ? 'text-red-600 font-bold' : ''}`}>
                      {formatCurrency(category.remaining)}
                    </td>
                    <td className="py-3 w-1/4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            category.spent / category.budget > 0.9 ? 'bg-red-500' : 'bg-blue-600'
                          }`} 
                          style={{ width: `${Math.min(100, (category.spent / category.budget) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleCategoryVisibility(category.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          category.visible 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {category.visible ? 'Ja' : 'Nei'}
                      </button>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-b bg-blue-50">
                  <td className="py-3 font-bold">Total</td>
                  <td className="py-3 font-bold">{formatCurrency(calculateTotalAllocated())}</td>
                  <td className="py-3 font-bold">100%</td>
                  <td className="py-3 font-bold">{formatCurrency(totals.spent)}</td>
                  <td className="py-3 font-bold">{formatCurrency(totals.remaining)}</td>
                  <td className="py-3" colSpan="3">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                        <div 
                          className={`h-3 rounded-full ${totals.percentUsed > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
                          style={{ width: `${Math.min(100, totals.percentUsed)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{totals.percentUsed}%</span>
                    </div>
                  </td>
                </tr>
                <tr className={`${calculateUnallocatedBudget() < 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  <td className="py-3 font-medium">Ufordelt budsjett</td>
                  <td className="py-3 font-bold" colSpan="7">
                    {formatCurrency(calculateUnallocatedBudget())}
                    {calculateUnallocatedBudget() < 0 && 
                      <span className="ml-2 text-xs text-red-600">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Administrer utgifter</h2>
              <button 
                onClick={() => setIsAddingExpense(!isAddingExpense)} 
                className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
              >
                <PlusCircle size={16} className="mr-1" /> Legg til utgift
              </button>
            </div>
            
            {/* Add Expense Form */}
            {isAddingExpense && (
              <div className="bg-blue-50 p-4 mb-6 rounded">
                <h3 className="font-medium mb-3">Ny utgift</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select 
                      value={newExpense.category}
                      onChange={(event) => setNewExpense({...newExpense, category: Number(event.target.value)})}
                      className="border rounded px-2 py-1 w-full"
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
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Beskriv utgiften"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Beløp</label>
                    <input 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(event) => setNewExpense({...newExpense, amount: Number(event.target.value)})}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dato</label>
                    <input 
                      type="date" 
                      value={newExpense.date}
                      onChange={(event) => setNewExpense({...newExpense, date: event.target.value})}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frekvens</label>
                    <select 
                      value={newExpense.recurring}
                      onChange={(event) => setNewExpense({...newExpense, recurring: event.target.value})}
                      className="border rounded px-2 py-1 w-full"
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
                    className="bg-green-600 text-white px-4 py-1 rounded mr-2 disabled:bg-green-300"
                  >
                    Lagre utgift
                  </button>
                  <button 
                    onClick={() => setIsAddingExpense(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-1 rounded"
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
                  <th className="text-left py-2">Beskrivelse</th>
                  <th className="text-left py-2">Kategori</th>
                  <th className="text-left py-2">Beløp</th>
                  <th className="text-left py-2">Dato</th>
                  <th className="text-left py-2">Frekvens</th>
                  <th className="text-left py-2">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                  const category = categories.find(c => c.id === expense.category);
                  return (
                    <tr key={expense.id} className="border-b">
                      <td className="py-3" title={expense.description}>
                        {abbreviateText(expense.description, 20)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center" title={category?.name}>
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category?.color }}></div>
                          {abbreviateText(category?.name, 12)}
                        </div>
                      </td>
                      <td className="py-3">{formatCurrency(expense.amount)}</td>
                      <td className="py-3">{new Date(expense.date).toLocaleDateString('nb-NO')}</td>
                      <td className="py-3">
                        {expense.recurring === 'monthly' ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Månedlig</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Engangs</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Årlig budsjettprognose</h2>
            
            {/* Cumulative Spending Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Akkumulerte utgifter vs budsjett</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecast}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      name="Akkumulerte utgifter" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="remaining" 
                      name="Gjenstående budsjett" 
                      stroke="#82ca9d" 
                    />
                    {/* Budget Reference Line */}
                    <Line 
                      type="monotone" 
                      dataKey={() => totalBudget} 
                      name="Totalt budsjett" 
                      stroke="#ff7300" 
                      strokeDasharray="5 5" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Monthly Breakdown Chart */}
            <div>
              <h3 className="text-lg font-medium mb-4">Månedlige utgifter per kategori</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forecast}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend 
                      onClick={(data) => {
                        const category = categories.find(c => c.name === data.dataKey);
                        if (category) toggleCategoryVisibility(category.id);
                      }}
                      formatter={(value) => abbreviateText(value, 10)}
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
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Månedlige budsjettdetaljer</h3>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Kategorier som vises:</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategoryVisibility(category.id)}
                      className={`px-2 py-1 text-xs rounded-full flex items-center ${
                        category.visible 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-500 border border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-1" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span title={category.name}>{abbreviateText(category.name, 8)}</span>
                      {!category.visible && <span className="ml-1">❌</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Måned</th>
                      {categories.filter(c => c.visible).map(category => (
                        <th key={category.id} className="text-left py-2" title={category.name}>
                          {abbreviateText(category.name, 8)}
                        </th>
                      ))}
                      <th className="text-left py-2">Total</th>
                      <th className="text-left py-2">Akkumulert</th>
                      <th className="text-left py-2">Gjenstående</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((month, index) => (
                      <tr key={index} className={`border-b ${currentMonth === index ? 'bg-blue-50' : ''}`}>
                        <td className="py-2 font-medium">{month.name}</td>
                        {categories.filter(c => c.visible).map(category => (
                          <td key={category.id} className="py-2">
                            {month[category.name] > 0 ? formatCurrency(month[category.name]) : '-'}
                          </td>
                        ))}
                        <td className="py-2">{formatCurrency(month.total)}</td>
                        <td className="py-2">{formatCurrency(month.cumulative)}</td>
                        <td className={`py-2 ${month.remaining < 0 ? 'text-red-600 font-bold' : ''}`}>
                          {formatCurrency(month.remaining)}
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
      )}

          {/* Footer */}
          <footer className="bg-gray-100 p-4 border-t">
            <div className="container mx-auto text-sm text-gray-600 text-center">
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
    </div>
  );
};

export default BudgetTracker;
