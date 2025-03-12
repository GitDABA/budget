import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { CategoryWithSpent, NewExpenseData } from './BudgetTypes';
import { Expense } from '@/lib/supabase';
import { formatCurrency } from './BudgetCalculations';
import './budgetTracker.css';

interface ExpensesViewProps {
  categories: CategoryWithSpent[];
  expenses: Expense[];
  onAddExpense: (expense: NewExpenseData) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({
  categories,
  expenses,
  onAddExpense,
  onDeleteExpense
}) => {
  // Local state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<NewExpenseData>({
    category_id: categories.length > 0 ? categories[0].id : '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurring: 'one-time'
  });

  // Handle form submission
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

  return (
    <div className="space-y-6">
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full">
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
        <h3 className="font-medium mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Utgiftsoversikt</h3>
        {expenses.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Kategori</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Beskrivelse</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Beløp</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Dato</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Type</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {expenses.map(expense => {
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="category-color-indicator category-color" style={{ '--category-color': getCategoryColor(expense.category_id) } as React.CSSProperties} aria-hidden="true"></div>
                        {getCategoryName(expense.category_id)}
                      </div>
                    </td>
                    <td className="py-3">{expense.description}</td>
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
                        onClick={() => onDeleteExpense(expense.id)}
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
        ) : (
          <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
            Ingen utgifter registrert ennå
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesView;
