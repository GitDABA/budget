'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Budget, Category, Expense } from '@/lib/supabase';

interface BudgetContextType {
  budgets: Budget[];
  selectedBudget: Budget | null;
  isLoading: boolean;
  error: string | null;
  createBudget: (name: string, amount: number, useTemplate?: boolean) => Promise<Budget | null>;
  selectBudget: (budgetId: string) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<boolean>;
  fetchBudgetDetails: (budgetId: string) => Promise<{
    categories: Category[];
    expenses: Expense[];
  } | null>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  createExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense | null>;
  updateBudget: (budget: Partial<Budget> & { id: string }) => Promise<Budget | null>;
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

  // Delete a budget
  const deleteBudget = async (budgetId: string): Promise<boolean> => {
    try {
      // First, delete all associated categories and expenses
      await Promise.all([
        supabase.from('categories').delete().eq('budget_id', budgetId),
        supabase.from('expenses').delete().eq('budget_id', budgetId)
      ]);
      
      // Then delete the budget itself
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) {
        throw error;
      }

      // Update local state
      setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetId));
      
      // If the deleted budget was selected, clear selection
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(null);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting budget:', error.message);
      setError(error.message);
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
        fetchBudgetDetails,
        createCategory,
        createExpense,
        updateBudget
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
