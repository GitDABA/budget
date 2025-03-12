import React, { useState } from 'react';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { CategoryWithSpent, BudgetTotals, NewExpenseData } from './BudgetTypes';
import { Expense } from '@/lib/supabase';
import { formatCurrency, calculateTotalAllocated, calculateUnallocatedBudget } from './BudgetCalculations';
import { getProgressBarStyle } from '@/utils/styleUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './budgetTracker.css';

interface DashboardViewProps {
  totalBudget: number;
  setTotalBudget: (value: number) => void;
  categories: CategoryWithSpent[];
  totals: BudgetTotals;
  handleExportData: () => void;
  expenses: Expense[];
  onAddExpense: (expense: NewExpenseData) => void;
  onDeleteExpense: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  totalBudget,
  setTotalBudget,
  categories,
  totals,
  handleExportData,
  expenses,
  onAddExpense,
  onDeleteExpense
}) => {
  // Get visible categories for the chart
  const visibleCategories = categories.filter(category => category.visible);
  
  // Prepare data for the pie chart
  const pieData = visibleCategories.map(category => ({
    name: category.name,
    value: category.budget,
    color: category.color
  }));
  
  // State for new expense form
  const [newExpense, setNewExpense] = useState<NewExpenseData>({
    category_id: categories.length > 0 ? categories[0].id : '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time'
  });
  
  // Get recent expenses (last 5)
  const recentExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);
  
  // Helper functions
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Ukjent kategori';
  };
  
  const getCategoryColor = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.color : '#ccc';
  };
  
  // Handle expense submission
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category_id || !newExpense.description || newExpense.amount <= 0) {
      alert('Vennligst fyll ut alle feltene');
      return;
    }
    
    onAddExpense(newExpense);
    setNewExpense({
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      recurring: 'one-time'
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full" data-id="dashboard-grid">
      {/* Budget Overview Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 flex flex-col transition-colors duration-200 w-full h-full" data-id="budget-overview-card">
        <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Budsjettoversikt</h2>
        <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
          <span>Totalt budsjett:</span>
          <span>{formatCurrency(totalBudget)}</span>
        </div>
        <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
          <span>Fordelt på kategorier:</span>
          <span>{formatCurrency(calculateTotalAllocated(categories))}</span>
        </div>
        <div className="flex justify-between mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
          <span>Ufordelt budsjett:</span>
          <span className={calculateUnallocatedBudget(totalBudget, categories) < 0 ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-primary-600 dark:text-primary-400'}>
            {formatCurrency(calculateUnallocatedBudget(totalBudget, categories))}
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

      {/* Budget Allocation Chart Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full h-full" data-id="budget-allocation-chart">
        <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Budsjettfordeling</h2>
        <div className="h-64">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-text-light-secondary dark:text-text-dark-secondary">
              Ingen kategorier å vise
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="font-medium mb-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Kategorifordeling</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {visibleCategories.map(category => (
              <div key={category.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="category-color-indicator category-color" 
                    style={{ '--category-color': category.color } as React.CSSProperties} 
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-sm">{formatCurrency(category.budget)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full" data-id="add-expense-card">
        <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Legg til utgift</h2>
        <form onSubmit={handleSubmitExpense}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
              <label className="block text-sm font-medium mb-1">Beløp</label>
              <input 
                type="number" 
                value={newExpense.amount}
                onChange={(event) => setNewExpense({...newExpense, amount: Number(event.target.value)})}
                className="border rounded px-2 py-1 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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
          <div className="flex justify-end">
            <button 
              type="submit"
              className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-2 rounded flex items-center hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              <PlusCircle size={16} className="mr-1" /> Legg til utgift
            </button>
          </div>
        </form>
      </div>

      {/* Recent Expenses Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full" data-id="recent-expenses-card">
        <h2 className="text-xl font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Siste utgifter</h2>
        
        {recentExpenses.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <thead>
              <tr>
                <th className="py-2 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Beskrivelse</th>
                <th className="py-2 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Beløp</th>
                <th className="py-2 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Dato</th>
                <th className="py-2 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {recentExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                  <td className="py-2">
                    <div className="flex items-center">
                      <div 
                        className="category-color-indicator category-color" 
                        style={{ '--category-color': getCategoryColor(expense.category_id) } as React.CSSProperties}
                        aria-hidden="true"
                      ></div>
                      {expense.description}
                    </div>
                  </td>
                  <td className="py-2">{formatCurrency(expense.amount)}</td>
                  <td className="py-2">{new Date(expense.date).toLocaleDateString('nb-NO')}</td>
                  <td className="py-2 text-right">
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 transition-colors duration-200"
                      title="Slett utgift"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
            Ingen utgifter registrert ennå
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
