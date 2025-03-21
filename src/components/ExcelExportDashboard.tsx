import React, { useState } from 'react';
import { Download, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportBudgetToExcel, ExportOptions, ExtendedBudget } from '@/utils/excelExport';
import { availableCurrencies, CurrencyConfig, defaultCurrency } from '@/utils/currencyUtils';
import { Category, Expense } from '@/lib/supabase';
import { ForecastData } from '@/components/budget-tracker/BudgetTypes';
import { supabase } from '@/utils/supabaseClient';
import { motion } from 'framer-motion';

interface ExcelExportDashboardProps {
  budget: ExtendedBudget;
  onClose?: () => void;
}

export const ExcelExportDashboard: React.FC<ExcelExportDashboardProps> = ({ budget, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeOverview: true,
    includeCategories: true,
    includeTransactions: true,
    includeForecast: true,
    includeCategorySpending: true,
    currency: defaultCurrency,
    fileName: `${budget.name || 'Budget'}-Export.xlsx`,
    addCharts: true,
    colorCodeEntries: true,
  });

  // Handler for checkbox changes
  const handleCheckboxChange = (field: keyof ExportOptions) => {
    setExportOptions((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handler for currency change
  const handleCurrencyChange = (currencyCode: string) => {
    const selectedCurrency = availableCurrencies.find(c => c.code === currencyCode) || defaultCurrency;
    setExportOptions((prev) => ({
      ...prev,
      currency: selectedCurrency,
    }));
  };

  // Handler for filename change
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportOptions((prev) => ({
      ...prev,
      fileName: e.target.value,
    }));
  };

  // Export function
  const handleExport = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Excel export process...');

      // Fetch categories
      console.log('Fetching categories...');
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budget.id);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      console.log(`Successfully fetched ${categories?.length || 0} categories`);

      // Fetch transactions
      console.log('Fetching transactions...');
      const { data: transactions, error: transactionsError } = await supabase
        .from('expenses')
        .select('*')
        .eq('budget_id', budget.id);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        throw transactionsError;
      }
      console.log(`Successfully fetched ${transactions?.length || 0} transactions`);

      // Generate forecast data
      console.log('Generating forecast data...');
      const forecastData = generateForecastData(budget, categories || [], transactions || []);
      console.log(`Generated ${forecastData.length} forecast data points`);

      // Call the export function with detailed error handling
      try {
        console.log('Calling exportBudgetToExcel function...');
        await exportBudgetToExcel(
          budget,
          categories || [],
          transactions || [],
          forecastData,
          exportOptions
        );
        console.log('Excel export completed successfully');
        
        // Close the dialog
        if (onClose) onClose();
      } catch (exportError) {
        console.error('Error in Excel export function:', exportError);
        if (exportError instanceof Error) {
          console.error('Error name:', exportError.name);
          console.error('Error message:', exportError.message);
          console.error('Error stack:', exportError.stack);
        }
        throw exportError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('Error exporting Excel file:', error);
      let errorMessage = 'Failed to export Excel file. ';
      
      if (error instanceof Error) {
        errorMessage += error.message || 'See console for details.';
      } else {
        errorMessage += 'Please check browser console for details.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate forecast data
  const generateForecastData = (budget: ExtendedBudget, categories: Category[], transactions: Expense[]): ForecastData[] => {
    // This is a simplified version - adapt it based on your actual forecast calculation logic
    const startDate = budget.startDate ? new Date(budget.startDate) : new Date();
    const months: ForecastData[] = [];
    
    // Create array of month names (e.g., "Jan 2025", "Feb 2025")
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Initialize empty month data
      const monthData: ForecastData = {
        name: monthName,
        month: i,
        total: 0,
        cumulative: 0,
        remaining: budget.totalBudget || budget.total_amount
      };
      
      // Add empty category values
      categories.forEach(category => {
        monthData[category.name] = 0;
      });
      
      months.push(monthData);
    }
    
    // Process transactions to fill in month data
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthIndex = transactionDate.getMonth() - startDate.getMonth() + 
        (transactionDate.getFullYear() - startDate.getFullYear()) * 12;
      
      // Skip if transaction is outside our forecast window
      if (monthIndex < 0 || monthIndex >= months.length) return;
      
      // Find category
      const category = categories.find(c => c.id === transaction.category_id);
      
      if (category) {
        // Add to category spending
        months[monthIndex][category.name] = (months[monthIndex][category.name] || 0) + transaction.amount;
      }
      
      // Add to total spending for month
      months[monthIndex].total += transaction.amount;
    });
    
    // Calculate cumulative spending and remaining budget
    let cumulativeSpending = 0;
    months.forEach(month => {
      cumulativeSpending += month.total;
      month.cumulative = cumulativeSpending;
      month.remaining = (budget.totalBudget || budget.total_amount) - cumulativeSpending;
    });
    
    return months;
  };

  return (
    <>
      {/* Add backdrop overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => onClose && onClose()}></div>
      
      <Dialog open={true} onOpenChange={() => onClose && onClose()}>
        <DialogContent className="sm:max-w-[550px] rounded-lg shadow-lg border border-gray-700 bg-gray-900 text-white">
          <DialogHeader className="pb-2 border-b border-gray-700">
            <DialogTitle className="text-2xl font-bold text-white">Excel Export Options</DialogTitle>
            <button 
              onClick={() => onClose && onClose()} 
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-800 opacity-70 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-5 w-5 text-gray-400" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

        <div className="grid gap-6 py-4 px-2">
          <div className="grid gap-2">
            <Label htmlFor="currency" className="font-medium text-gray-300">Currency</Label>
            <Select 
              defaultValue={exportOptions.currency?.code || 'EUR'}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="border-gray-700 bg-gray-800 rounded-md h-12 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filename" className="font-medium text-gray-300">File Name</Label>
            <input
              id="filename"
              type="text"
              aria-label="Excel file name" 
              title="Enter file name for Excel export"
              placeholder="Enter file name"
              className="flex h-12 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              value={exportOptions.fileName}
              onChange={handleFileNameChange}
            />
          </div>

          <div className="grid gap-1">
            <Label className="mb-2 text-lg font-semibold text-gray-200">Include Worksheets</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeOverview" 
                checked={exportOptions.includeOverview}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('includeOverview')}
              />
              <Label htmlFor="includeOverview" className="cursor-pointer text-gray-300">Budget Overview</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeCategories" 
                checked={exportOptions.includeCategories}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('includeCategories')}
              />
              <Label htmlFor="includeCategories" className="cursor-pointer text-gray-300">Categories</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeTransactions" 
                checked={exportOptions.includeTransactions}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('includeTransactions')}
              />
              <Label htmlFor="includeTransactions" className="cursor-pointer text-gray-300">Transactions</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeForecast" 
                checked={exportOptions.includeForecast}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('includeForecast')}
              />
              <Label htmlFor="includeForecast" className="cursor-pointer text-gray-300">Monthly Forecast</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeCategorySpending" 
                checked={exportOptions.includeCategorySpending}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('includeCategorySpending')}
              />
              <Label htmlFor="includeCategorySpending" className="cursor-pointer text-gray-300">Category Spending by Month</Label>
            </div>
          </div>

          <div className="grid gap-1">
            <Label className="mb-2 text-lg font-semibold text-gray-200">Visual Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="colorCodeEntries" 
                checked={exportOptions.colorCodeEntries}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('colorCodeEntries')}
              />
              <Label htmlFor="colorCodeEntries" className="cursor-pointer text-gray-300">Color-code entries by category</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="addCharts" 
                checked={exportOptions.addCharts}
                className="data-[state=checked]:bg-blue-500 border-gray-600"
                onCheckedChange={() => handleCheckboxChange('addCharts')}
              />
              <Label htmlFor="addCharts" className="cursor-pointer text-gray-300">Include data visualizations</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-700 flex justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => onClose && onClose()}
            className="rounded-md border-gray-700 bg-gray-800 hover:bg-gray-700 text-white transition-all h-12 px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isLoading}
            className="rounded-md bg-green-600 hover:bg-green-500 text-white font-medium h-12 px-6 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center"
          >
            {isLoading ? 'Exporting...' : 'Export to Excel'}
            <Download className="ml-2 h-5 w-5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    
  );
};

// Button that opens the Excel Export Dashboard
export const ExcelExportButton: React.FC<{ budget: ExtendedBudget }> = ({ budget }) => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowDashboard(true)}
        className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <Download className="mr-1 h-4 w-4" />
        <span className="hidden md:inline">Excel</span>
        <span className="md:hidden">Excel</span>
      </motion.button>

      {showDashboard && (
        <ExcelExportDashboard 
          budget={budget} 
          onClose={() => setShowDashboard(false)} 
        />
      )}
    </>
  );
};

export default ExcelExportButton;
