'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Budget, Category, Expense } from '@/lib/supabase';
import { deleteItem, testSupabaseConnection, testDeletePermission } from '@/lib/supabaseHelpers';

interface BudgetContextType {
  budgets: Budget[];
  selectedBudget: Budget | null;
  isLoading: boolean;
  error: string | null;
  createBudget: (name: string, amount: number, useTemplate?: boolean) => Promise<Budget | null>;
  selectBudget: (budgetId: string) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  fetchBudgetDetails: (budgetId: string) => Promise<{
    categories: Category[];
    expenses: Expense[];
  } | null>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  updateCategory: (category: Partial<Category> & { id: string }) => Promise<Category | null>;
  createExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense | null>;
  updateExpense: (expense: Partial<Expense> & { id: string }) => Promise<Expense | null>;
  updateBudget: (budget: Partial<Budget> & { id: string }) => Promise<Budget | null>;
  testSupabase: () => Promise<boolean>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all budgets on component mount
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setBudgets(data as Budget[]);
        
        // Select the most recent budget if there is one
        if (data && data.length > 0) {
          setSelectedBudget(data[0] as Budget);
        }
      } catch (error: any) {
        console.error('Error fetching budgets:', error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Default template categories for new budgets
  const defaultCategories = [
    { name: 'Mat / Drikke Dagligvare', color: '#0088FE', budget: 4000, visible: true },
    { name: 'Vinmonopolet', color: '#00C49F', budget: 2000, visible: true },
    { name: 'Holmenkollstafetten', color: '#FFBB28', budget: 1500, visible: true },
    { name: 'Opplevelser', color: '#FF8042', budget: 2000, visible: true },
    { name: 'Leie av lokaler', color: '#A28BFF', budget: 3000, visible: true },
    { name: 'Bonger', color: '#FF6B6B', budget: 1500, visible: true },
    { name: 'Foredragsholdere', color: '#4ECDC4', budget: 2000, visible: true }
  ];

  // Create a new budget
  const createBudget = async (name: string, amount: number, useTemplate: boolean = true): Promise<Budget | null> => {
    try {
      // Ensure the amount is a valid number
      const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          { 
            name, 
            total_amount: validAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newBudget = data as Budget;
      setBudgets(prevBudgets => [newBudget, ...prevBudgets]);
      setSelectedBudget(newBudget);
      
      // If using template, create default categories for the new budget
      if (useTemplate) {
        for (const category of defaultCategories) {
          await createCategory({
            budget_id: newBudget.id,
            name: category.name,
            color: category.color,
            budget: category.budget,
            visible: category.visible
          });
        }
      }
      
      return newBudget;
    } catch (error: any) {
      console.error('Error creating budget:', error.message);
      setError(error.message);
      return null;
    }
  };

  // Select a budget by id
  const selectBudget = async (budgetId: string): Promise<void> => {
    const budget = budgets.find(b => b.id === budgetId) || null;
    setSelectedBudget(budget);
  };

  // Fetch categories and expenses for a budget
  const fetchBudgetDetails = async (budgetId: string) => {
    try {
      const [categoriesResponse, expensesResponse] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('budget_id', budgetId)
          .order('name'),
        supabase
          .from('expenses')
          .select('*')
          .eq('budget_id', budgetId)
          .order('date', { ascending: false })
      ]);

      if (categoriesResponse.error) {
        throw categoriesResponse.error;
      }

      if (expensesResponse.error) {
        throw expensesResponse.error;
      }

      return {
        categories: categoriesResponse.data as Category[],
        expenses: expensesResponse.data as Expense[]
      };
    } catch (error: any) {
      console.error('Error fetching budget details:', error.message);
      setError(error.message);
      return null;
    }
  };

  // Create a new category
  const createCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Category;
    } catch (error: any) {
      console.error('Error creating category:', error.message);
      setError(error.message);
      return null;
    }
  };

  // Update an existing category
  const updateCategory = async (category: Partial<Category> & { id: string }): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(category) // Remove updated_at since the column doesn't exist
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedCategory = data as Category;
      
      // We don't need to update local state here as it's handled in the component
      // that calls this function
      
      return updatedCategory;
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      setError(error.message);
      return null;
    }
  };

  // Create a new expense
  const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense | null> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Expense;
    } catch (error: any) {
      console.error('Error creating expense:', error.message);
      setError(error.message);
      return null;
    }
  };

  // Test Supabase connection and permissions
  const testSupabase = async () => {
    console.log('Testing Supabase connection and permissions...');
    
    try {
      // First test basic connection
      const connTest = await testSupabaseConnection();
      if (!connTest.success) {
        console.error('Supabase connection test failed:', connTest.message);
        setError('Database connection error: ' + connTest.message);
        return false;
      }
      
      // Then test delete permissions on budgets
      const permTest = await testDeletePermission('budgets');
      console.log('Permission test result:', permTest);
      
      return permTest.success;
    } catch (error: any) {
      console.error('Error testing Supabase:', error);
      setError('Error testing database: ' + (error.message || 'Unknown error'));
      return false;
    }
  };
  
  // Delete a budget - simplified with standardized deletion helper
  const deleteBudget = async (budgetId: string): Promise<boolean> => {
    console.log('Attempting to delete budget with ID:', budgetId);
    setError(null); // Clear any previous errors
    
    if (!budgetId) {
      setError('Invalid budget ID provided');
      return false;
    }
    
    // First test Supabase connection and permissions
    const testResult = await testSupabase();
    if (!testResult) {
      console.error('Supabase connection or permission test failed');
      return false;
    }

    try {
      // First delete all associated expenses (no dependencies)
      const expenseResult = await deleteItem('expenses', budgetId, 'budget_id');
      if (!expenseResult.success) {
        console.log('Note: No expenses to delete or error deleting expenses', expenseResult.message);
        // Continue anyway - just a warning
      }
      
      // Then delete categories associated with this budget
      const categoryResult = await deleteItem('categories', budgetId, 'budget_id');
      if (!categoryResult.success) {
        console.log('Note: No categories to delete or error deleting categories', categoryResult.message);
        // Continue anyway - just a warning
      }
      
      // Finally delete the budget itself
      const result = await deleteItem('budgets', budgetId);
      
      if (!result.success) {
        setError(result.message || 'Failed to delete budget');
        return false;
      }
      
      // Update local state on success
      setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetId));
      
      // If the deleted budget was selected, clear selection
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(null);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteBudget:', error);
      setError(error.message || 'An unexpected error occurred');
      return false;
    }
  };
  
  // Delete a category and its associated expenses
  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    console.log('Attempting to delete category with ID:', categoryId);
    setError(null);
    
    if (!categoryId) {
      setError('Invalid category ID provided');
      return false;
    }
    
    try {
      // First delete associated expenses
      const expenseResult = await deleteItem('expenses', categoryId, 'category_id');
      if (!expenseResult.success) {
        console.log('Note: No expenses found or error deleting expenses for category', expenseResult.message);
        // Continue anyway
      }
      
      // Then delete the category itself
      const result = await deleteItem('categories', categoryId);
      
      if (!result.success) {
        setError(result.message || 'Failed to delete category');
        return false;
      }
      
      // Update the UI by refetching budget details if a budget is selected
      if (selectedBudget) {
        await fetchBudgetDetails(selectedBudget.id);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteCategory:', error);
      setError(error.message || 'An unexpected error occurred');
      return false;
    }
  };
  
  // Update a budget
  const updateBudget = async (budget: Partial<Budget> & { id: string }): Promise<Budget | null> => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ ...budget, updated_at: new Date().toISOString() })
        .eq('id', budget.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedBudget = data as Budget;
      setBudgets(prevBudgets => 
        prevBudgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
      );
      
      if (selectedBudget?.id === updatedBudget.id) {
        setSelectedBudget(updatedBudget);
      }
      
      return updatedBudget;
    } catch (error: any) {
      console.error('Error updating budget:', error.message);
      setError(error.message);
      return null;
    }
  };

  // Delete an expense
  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    console.log('Attempting to delete expense with ID:', expenseId);
    setError(null);
    
    if (!expenseId) {
      setError('Invalid expense ID provided');
      return false;
    }
    
    try {
      // Delete the expense
      const result = await deleteItem('expenses', expenseId);
      
      if (!result.success) {
        setError(result.message || 'Failed to delete expense');
        return false;
      }
      
      // Update the UI by refetching budget details if a budget is selected
      if (selectedBudget) {
        await fetchBudgetDetails(selectedBudget.id);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteExpense:', error);
      setError(error.message || 'An unexpected error occurred');
      return false;
    }
  };

  // Update an expense
  const updateExpense = async (expense: Partial<Expense> & { id: string }): Promise<Expense | null> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', expense.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedExpense = data as Expense;
      
      // We don't need to update local state here as it's handled in the component
      // that calls this function
      
      return updatedExpense;
    } catch (error: any) {
      console.error('Error updating expense:', error.message);
      setError(error.message);
      return null;
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        selectedBudget,
        isLoading,
        error,
        createBudget,
        selectBudget,
        deleteBudget,
        deleteCategory,
        deleteExpense,
        fetchBudgetDetails,
        createCategory,
        updateCategory,
        createExpense,
        updateExpense,
        updateBudget,
        testSupabase
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
