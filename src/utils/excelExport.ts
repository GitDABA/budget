import ExcelJS from 'exceljs';
import { Budget, Category, Expense } from '@/lib/supabase';
import { CategoryWithSpent, ForecastData } from '@/components/budget-tracker/BudgetTypes';
import { CurrencyConfig, defaultCurrency } from './currencyUtils';

type Transaction = Expense;

// Extended budget type with additional fields used in our app
export interface ExtendedBudget extends Budget {
  totalBudget: number; // Equivalent to total_amount in the DB
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ExportOptions {
  includeOverview?: boolean;
  includeCategories?: boolean;
  includeTransactions?: boolean;
  includeForecast?: boolean;
  includeCategorySpending?: boolean;
  currency?: CurrencyConfig;
  fileName?: string;
  addCharts?: boolean;
  colorCodeEntries?: boolean;
  includeLogo?: boolean;
  logoUrl?: string;
}

/**
 * Generates and downloads an Excel file containing the budget data
 * including overview, categories, transactions, and forecast data
 */
export const exportBudgetToExcel = async (
  budget: ExtendedBudget,
  categories: Category[],
  transactions: Transaction[],
  forecastData: ForecastData[],
  options: ExportOptions = {}
) => {
  // Debug log - start of export
  console.log('Starting Excel export with data:', {
    budgetName: budget?.name,
    categoriesCount: categories?.length || 0,
    transactionsCount: transactions?.length || 0,
    forecastCount: forecastData?.length || 0
  });
  
  let workbook: ExcelJS.Workbook | null = null;
  let buffer: Buffer | ArrayBuffer | null = null;
  // Set default options
  const exportOptions: ExportOptions = {
    includeOverview: true,
    includeCategories: true,
    includeTransactions: true,
    includeForecast: true,
    includeCategorySpending: true,
    currency: defaultCurrency,
    fileName: `${budget.name || 'Budget'}-Export.xlsx`,
    addCharts: true,
    colorCodeEntries: true,
    includeLogo: false,
    logoUrl: '',
    ...options
  };
  
  const { currency } = exportOptions;
  try {
    // Create a new workbook
    console.log('Creating Excel workbook...');
    workbook = new ExcelJS.Workbook();
    workbook.creator = 'Budget App';
    workbook.lastModifiedBy = 'Budget App User';
    workbook.created = new Date();
    workbook.modified = new Date();
    console.log('Workbook created successfully');
    // Add Budget Overview sheet
  const overviewSheet = workbook.addWorksheet('Budget Overview');
  
  // Set some fancy headers with styling
  overviewSheet.columns = [
    { header: 'Property', key: 'property', width: 20 },
    { header: 'Value', key: 'value', width: 30 }
  ];
  
  // Style the header row
  // Apply bold, white text on blue background
  overviewSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  overviewSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  };
  
  // Add bottom border
  overviewSheet.getRow(1).border = {
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  
  // Center align
  overviewSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add budget overview data
  overviewSheet.addRow({ property: 'Budget Name', value: budget.name });
  overviewSheet.addRow({ property: 'Total Budget', value: budget.totalBudget || budget.total_amount });
  overviewSheet.addRow({ property: 'Start Date', value: budget.startDate ? new Date(budget.startDate) : 'N/A' });
  overviewSheet.addRow({ property: 'End Date', value: budget.endDate ? new Date(budget.endDate) : 'N/A' });
  overviewSheet.addRow({ property: 'Description', value: budget.description || 'N/A' });

  // Add Categories sheet
  const categoriesSheet = workbook.addWorksheet('Categories');
  
  categoriesSheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Monthly Budget', key: 'budget', width: 15 },
    { header: 'Color', key: 'color', width: 15 },
    { header: '% of Total', key: 'percentage', width: 15 }
  ];
  
  // Style the header row
  // Apply bold, white text on blue background
  categoriesSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  categoriesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  };
  
  // Add bottom border
  categoriesSheet.getRow(1).border = {
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  
  // Center align
  categoriesSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add category data
  const totalBudget = budget.totalBudget || budget.total_amount || 1; // Prevent division by zero
  
  // Add category data with formulas for percentage calculations
  categories.forEach((category, index) => {
    const rowIndex = index + 2; // Row index (2-based for header)
    
    categoriesSheet.addRow({
      name: category.name,
      budget: category.budget,
      color: category.color,
      percentage: '' // Will add formula instead of static value
    });
    
    // Add formula for percentage: =B{row}/SUM(B2:B{lastRow})*100
    categoriesSheet.getCell(`D${rowIndex}`).value = {
      formula: `B${rowIndex}/${totalBudget}*100`,
      date1904: false
    };
    // Format as percentage
    categoriesSheet.getCell(`D${rowIndex}`).numFmt = '0.00\%';
  });
  
  // Format the budget column as currency
  categoriesSheet.getColumn('budget').numFmt = currency?.format || '€#,##0.00';
  
  // Add Transactions sheet
  const transactionsSheet = workbook.addWorksheet('Transactions');
  
  transactionsSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 }
  ];
  
  // Style the header row
  // Apply bold, white text on blue background
  transactionsSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  transactionsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  };
  
  // Add bottom border
  transactionsSheet.getRow(1).border = {
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  
  // Center align
  transactionsSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add transaction data with variance column and formulas
  // First, add an additional column for budgeted amount and variance
  transactionsSheet.columns.push({ header: 'Budgeted', key: 'budgeted', width: 15 });
  transactionsSheet.columns.push({ header: 'Variance', key: 'variance', width: 15 });
  
  // Style the new header cells using numeric indices
  try {
    // Budget column header (column E)
    const budgetHeaderCell = transactionsSheet.getRow(1).getCell(5); // E1
    budgetHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    budgetHeaderCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' }
    };
    budgetHeaderCell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } }
    };
    budgetHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Variance column header (column F)
    const varianceHeaderCell = transactionsSheet.getRow(1).getCell(6); // F1
    varianceHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    varianceHeaderCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' }
    };
    varianceHeaderCell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } }
    };
    varianceHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
  } catch (error) {
    console.warn('Error styling header cells:', error);
  }
  
  // Format the new columns using column indices
  try {
    // Don't use getColumn at all, use cell-by-cell approach instead
    // This is the safest way to avoid Excel column limits
    
    // Format budgeted column (column E)
    for (let i = 2; i <= transactionsSheet.rowCount; i++) {
      try {
        const budgetCell = transactionsSheet.getRow(i).getCell(5);
        if (budgetCell) {
          budgetCell.numFmt = currency?.format || '€#,##0.00';
        }
      } catch (error) {
        // Skip if error and continue with other cells
      }
    }
    
    // Format variance column (column F)
    for (let i = 2; i <= transactionsSheet.rowCount; i++) {
      try {
        const varianceCell = transactionsSheet.getRow(i).getCell(6);
        if (varianceCell) {
          varianceCell.numFmt = currency?.format || '€#,##0.00';
        }
      } catch (error) {
        // Skip if error and continue with other cells
      }
    }
  } catch (error) {
    console.warn('Error formatting budget and variance columns:', error);
  }
  
  // Add transaction data
  transactions.forEach((transaction, index) => {
    try {
      // Find category name
      const categoryName = categories.find(c => c.id === transaction.category_id)?.name || 'Uncategorized';
      const rowIndex = index + 2; // Row index (2-based for header)
      
      // Ensure numeric values for amount and budgeted amount
      const amount = typeof transaction.amount === 'number' ? transaction.amount : 0;
      const budgetedAmount = typeof transaction.budgeted_amount === 'number' ? 
        transaction.budgeted_amount : amount;
      
      // Add row with data
      transactionsSheet.addRow({
        date: transaction.date ? new Date(transaction.date) : new Date(),
        category: categoryName,
        description: transaction.description || '',
        amount: amount,
        budgeted: budgetedAmount,
        variance: '' // Will add formula
      });
      
      try {
        // Add formula for variance: Budgeted - Actual
        // Instead of using column letters, use numeric indices
        // Define column indices (1-based in ExcelJS)
        const amountColumnIndex = 4;     // Column D
        const budgetColumnIndex = 5;     // Column E
        const varianceColumnIndex = 6;   // Column F
        
        // Get the variance cell by row and column index
        const varianceCell = transactionsSheet.getRow(rowIndex).getCell(varianceColumnIndex);
        varianceCell.value = {
          formula: `E${rowIndex}-D${rowIndex}`, // We can still use letters in formulas
          date1904: false
        };
        
        // Add conditional formatting for variance
        transactionsSheet.addConditionalFormatting({
          ref: `F${rowIndex}`,
          rules: [
            {
              type: 'cellIs',
              operator: 'greaterThan',
              formulae: ['0'],
              style: { font: { color: { argb: 'FF008000' } } }, // green
              priority: 1
            },
            {
              type: 'cellIs',
              operator: 'lessThan',
              formulae: ['0'],
              style: { font: { color: { argb: 'FFFF0000' } } }, // red
              priority: 2
            }
          ]
        });
      } catch (error) {
        console.warn(`Error processing variance for row ${rowIndex}:`, error);
        // Continue with next transaction if this one fails
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      // Continue with next transaction if this one fails
    }
  });
  
  // Format the date and amount columns using safe column indices
  try {
    // Use column indices instead of names to prevent out-of-bounds errors
    // Don't use getColumn at all, use cell-by-cell approach instead
    // This is the safest way to avoid Excel column limits
    
    // Format date column (column A)
    for (let i = 2; i <= transactionsSheet.rowCount; i++) {
      try {
        const dateCell = transactionsSheet.getRow(i).getCell(1);
        if (dateCell) {
          dateCell.numFmt = 'yyyy-mm-dd';
        }
      } catch (error) {
        // Skip if error and continue with other cells
      }
    }
    
    // Format amount column (column D)
    for (let i = 2; i <= transactionsSheet.rowCount; i++) {
      try {
        const amountCell = transactionsSheet.getRow(i).getCell(4);
        if (amountCell) {
          amountCell.numFmt = currency?.format || '€#,##0.00';
        }
      } catch (error) {
        // Skip if error and continue with other cells
      }
    }
  } catch (error) {
    console.warn('Error formatting date and amount columns:', error);
  }
  
  // Ensure all amounts are valid numbers (replace any NaN or undefined values with 0)
  try {
    for (let i = 2; i <= transactionsSheet.rowCount; i++) {
      try {
        // Use getCell with row and column indices (1-based)
        const amountCell = transactionsSheet.getRow(i).getCell(4); // Column D is 4th column
        if (amountCell.value === undefined || isNaN(Number(amountCell.value))) {
          amountCell.value = 0;
        }
        
        const budgetedCell = transactionsSheet.getRow(i).getCell(5); // Column E is 5th column
        if (budgetedCell.value === undefined || isNaN(Number(budgetedCell.value))) {
          budgetedCell.value = 0;
        }
      } catch (error) {
        console.warn(`Error validating amounts for row ${i}:`, error);
      }
    }
  } catch (error) {
    console.error('Error during amount validation:', error);
  }
  
  // Add a summary row with total actual and budgeted amounts
  const summaryRowIndex = transactionsSheet.rowCount + 2;
  transactionsSheet.addRow([
    'TOTALS', '', '', '', '', ''
  ]);
  
  // Make summary row bold
  try {
    transactionsSheet.getRow(summaryRowIndex).font = { bold: true };
    
    // Add SUM formulas safely with try/catch blocks
    // Column 4 (D) - Actual Amount
    try {
      // Use row/column indices instead of Excel-style references
      const amountColumn = 4; // Column D
      const amountCell = transactionsSheet.getRow(summaryRowIndex).getCell(amountColumn);
      
      // We can still use Excel column letters in formulas
      amountCell.value = {
        formula: `SUM(D2:D${transactionsSheet.rowCount-1})`,
        date1904: false
      };
      amountCell.numFmt = currency?.format || '€#,##0.00';
    } catch (error) {
      console.warn('Error setting formula for column D:', error);
    }
    
    // Column 5 (E) - Budgeted Amount
    try {
      // Use row/column indices instead of Excel-style references
      const budgetColumn = 5; // Column E
      const budgetCell = transactionsSheet.getRow(summaryRowIndex).getCell(budgetColumn);
      
      // We can still use Excel column letters in formulas
      budgetCell.value = {
        formula: `SUM(E2:E${transactionsSheet.rowCount-1})`,
        date1904: false
      };
      budgetCell.numFmt = currency?.format || '€#,##0.00';
    } catch (error) {
      console.warn('Error setting formula for column E:', error);
    }
    
    // Column 6 (F) - Variance (Budgeted - Actual)
    try {
      // Get the actual column index (0-based) for column F
      const varianceCol = 6; // column F is the 6th column (0-based index is 5)
      const cell = transactionsSheet.getRow(summaryRowIndex).getCell(varianceCol);
      cell.value = {
        formula: `E${summaryRowIndex}-D${summaryRowIndex}`,
        date1904: false
      };
      cell.numFmt = currency?.format || '€#,##0.00';
    } catch (error) {
      console.warn('Error setting formula for variance column:', error);
    }
  } catch (error) {
    console.error('Error creating summary row:', error);
  }
  
  // Add conditional formatting for the summary variance safely
  try {
    // Define the target cell for conditional formatting using column index
    const varianceColumn = 6; // Column F
    const varianceCellRef = `F${summaryRowIndex}`;
    
    transactionsSheet.addConditionalFormatting({
      ref: varianceCellRef,
      rules: [
        {
          type: 'cellIs',
          operator: 'greaterThan',
          formulae: ['0'],
          style: { font: { color: { argb: 'FF008000' } } }, // green
          priority: 1
        },
        {
          type: 'cellIs',
          operator: 'lessThan',
          formulae: ['0'],
          style: { font: { color: { argb: 'FFFF0000' } } }, // red
          priority: 2
        }
      ]
    });
  } catch (error) {
    console.warn('Error adding conditional formatting:', error);
  }
  
  // If color coding is enabled, color expenses by category
  if (exportOptions.colorCodeEntries) {
    // Start from row 2 (skip header)
    for (let i = 2; i <= transactionsSheet.rowCount; i++) {
      const row = transactionsSheet.getRow(i);
      const categoryName = row.getCell(2).value?.toString() || 'Uncategorized';
      const category = categories.find(c => c.name === categoryName);
      
      if (category) {
        // Convert hex color to ARGB
        const hex = category.color.replace('#', '');
        const argb = 'FF' + hex;
        
        // Apply light fill color
        row.getCell(4).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb }
        };
      }
    }
  }

  // Add Monthly Forecast sheet
  const forecastSheet = workbook.addWorksheet('Monthly Forecast');
  
  forecastSheet.columns = [
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Monthly Spending', key: 'spending', width: 20 },
    { header: 'Cumulative Spending', key: 'cumulative', width: 20 },
    { header: 'Remaining Budget', key: 'remaining', width: 20 }
  ];
  
  // Style the header row
  // Apply bold, white text on blue background
  forecastSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  forecastSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  };
  
  // Add bottom border
  forecastSheet.getRow(1).border = {
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  
  // Center align
  forecastSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add forecast data with formulas if available
  if (forecastData && forecastData.length > 0) {
    // Add total budget for reference
    forecastSheet.addRow({
      month: 'Total Budget',
      spending: totalBudget,
      cumulative: '',
      remaining: ''
    });
    forecastSheet.getRow(2).font = { bold: true };
    
    // Add formula for initial budget remaining using row/column indices
    try {
      forecastSheet.getRow(2).getCell(4).value = { // D2 (column 4, row 2)
        formula: 'B2',
        date1904: false
      };
    } catch (error) {
      console.warn('Error setting initial budget formula:', error);
    }
    
    // Add each month with formulas instead of static values
    forecastData.forEach((month, index) => {
      const rowIndex = index + 3; // Row index (3-based for header + budget row)
      
      forecastSheet.addRow({
        month: month.name,
        spending: month.total || 0, // Actual monthly spending (static for now)
        cumulative: '', // Will use formula
        remaining: ''   // Will use formula
      });
      
      // For first month, cumulative = spending
      try {
        if (index === 0) {
          // Column C (3) = cumulative
          forecastSheet.getRow(rowIndex).getCell(3).value = {
            formula: `IF(ISNUMBER(B${rowIndex}),B${rowIndex},0)`,
            date1904: false
          };
        } else {
          // For subsequent months, cumulative = previous cumulative + this month's spending
          forecastSheet.getRow(rowIndex).getCell(3).value = {
            formula: `IF(ISNUMBER(C${rowIndex-1}),C${rowIndex-1},0)+IF(ISNUMBER(B${rowIndex}),B${rowIndex},0)`,
            date1904: false
          };
        }
        
        // Formula for remaining: total budget - cumulative spending (prevent negative values)
        // Column D (4) = remaining budget
        forecastSheet.getRow(rowIndex).getCell(4).value = {
          formula: `MAX(0,IF(ISNUMBER(B2),B2,0)-IF(ISNUMBER(C${rowIndex}),C${rowIndex},0))`,
          date1904: false
        };
      } catch (error) {
        console.warn(`Error setting formulas for row ${rowIndex}:`, error);
      }
    });
    
    // Format the currency columns using cell-by-cell approach
    try {
      for (let i = 2; i <= forecastSheet.rowCount; i++) {
        try {
          // Format spending column (B)
          const spendingCell = forecastSheet.getRow(i).getCell(2);
          if (spendingCell) {
            spendingCell.numFmt = currency?.format || '€#,##0.00';
          }
          
          // Format cumulative column (C)
          const cumulativeCell = forecastSheet.getRow(i).getCell(3);
          if (cumulativeCell) {
            cumulativeCell.numFmt = currency?.format || '€#,##0.00';
          }
          
          // Format remaining column (D)
          const remainingCell = forecastSheet.getRow(i).getCell(4);
          if (remainingCell) {
            remainingCell.numFmt = currency?.format || '€#,##0.00';
          }
        } catch (error) {
          // Skip if error and continue with other rows
          console.warn(`Error formatting row ${i} in forecast sheet:`, error);
        }
      }
    } catch (error) {
      console.warn('Error formatting forecast currency columns:', error);
    }
    
    // Note: Charts are added but commented out due to TypeScript limitations
    // If you wish to use charts, uncomment this code and install the necessary dependencies
    /*
    // Add a chart (NOTE: ExcelJS has limited chart support)
    if (exportOptions.addCharts) {
      // Create a colorful heatmap-like visualization instead
      forecastSheet.addRow([]);
      forecastSheet.addRow(['Monthly Spending Visualization']);
      forecastSheet.addRow(['Month', 'Spending Heat']);
      
      forecastData.forEach((fd, index) => {
        // Calculate color intensity based on spending
        const maxSpending = Math.max(...forecastData.map(d => d.total));
        const intensity = Math.min(255, Math.round((fd.total / maxSpending) * 255));
        const colorValue = 255 - intensity;
        const color = `FF${colorValue.toString(16).padStart(2, '0')}${colorValue.toString(16).padStart(2, '0')}FF`;
        
        const row = forecastSheet.addRow([fd.name, fd.total]);
        row.getCell(2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        };
      });
    }
    */
  }

  // Add Category Spending sheet (monthly breakdown by category)
  const categorySpendingSheet = workbook.addWorksheet('Category Spending');
  
  // Create dynamic columns based on available months in forecast data
  const spendingColumns: any[] = [
    { header: 'Category', key: 'category', width: 25 }
  ];
  
  // Limit months to ensure we don't exceed Excel's column limit (16384)
  // Reserve some columns for the category and other potential data
  const MAX_MONTH_COLUMNS = 50; // Safe limit to avoid approaching Excel's column limit
  const months = (forecastData?.map(month => month.name) || []).slice(0, MAX_MONTH_COLUMNS);
  
  // Add columns safely up to the limit
  months.forEach(month => {
    spendingColumns.push({
      header: month,
      key: month.toString(), // Ensure key is a string
      width: 15
    });
  });
  
  categorySpendingSheet.columns = spendingColumns;
  
  // Style the header row
  // Apply bold, white text on blue background
  categorySpendingSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  categorySpendingSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  };
  
  // Add bottom border
  categorySpendingSheet.getRow(1).border = {
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  
  // Center align
  categorySpendingSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add category spending data if available
  if (categories.length > 0 && forecastData && forecastData.length > 0) {
    categories.forEach(category => {
      const row: any = { category: category.name };
      
      // Add spending for each month
      months.forEach(month => {
        const monthData = forecastData.find(m => m.name === month);
        // Use a safe key name by ensuring it's a valid string
        const monthKey = month.toString();
        row[monthKey] = monthData ? (monthData[category.name] || 0) : 0;
      });
      
      categorySpendingSheet.addRow(row);
    });
    
    // Simplify cell formatting for month columns
    // Format all month columns as currency using simplified approach
    try {
      // For each row in the category spending sheet, iterate through cells directly
      const rowCount = categorySpendingSheet.rowCount || 0;
      for (let rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
        // Format each month cell in the row (starting from column 2)
        for (let colIndex = 2; colIndex < 2 + months.length; colIndex++) {
          if (colIndex <= 16384) { // Excel's column limit
            try {
              // Apply currency format directly to each cell
              const cell = categorySpendingSheet.getCell(rowIndex, colIndex);
              // Only format cells that have values
              if (cell && typeof cell.value !== 'undefined') {
                cell.numFmt = currency?.format || '€#,##0.00';
              }
            } catch (cellError) {
              // Silent fail for individual cells
            }
          }
        }
      }
    } catch (error) {
      // Don't throw on formatting errors
      console.warn('Error during cell formatting, continuing export');
    }
    
    // Visual representation of data instead of charts for better compatibility
    if (exportOptions.addCharts) {
      // Create visual representation worksheet
      const visualsSheet = workbook.addWorksheet('Data Visualizations');
      
      // Add category distribution table with formulas
      visualsSheet.addRow(['Category Budget Distribution']);
      visualsSheet.getRow(visualsSheet.rowCount).font = { bold: true, size: 12 };
      visualsSheet.addRow(['Category', 'Budget', 'Percentage', 'Visual']);
      
      // Add reference row with total budget for formulas
      visualsSheet.addRow(['Total Budget', totalBudget, '', '']);
      const totalBudgetRow = visualsSheet.rowCount;
      visualsSheet.getRow(totalBudgetRow).font = { bold: true };
      
      categories.forEach((category, index) => {
        const dataRowIndex = visualsSheet.rowCount + 1;
        visualsSheet.addRow([category.name, category.budget, '', '']);
        
        // Use simple formula syntax for percentage
        try {
          // Formula for percentage but using direct cell references
          const budgetCell = visualsSheet.getCell(`B${dataRowIndex}`);
          const totalBudgetCell = visualsSheet.getCell(`B${totalBudgetRow}`);
          
          // Only apply formula if both cells have values
          if (budgetCell.value !== undefined && totalBudgetCell.value !== undefined) {
            visualsSheet.getCell(`C${dataRowIndex}`).value = {
              formula: `B${dataRowIndex}/B${totalBudgetRow}*100`
            };
            visualsSheet.getCell(`C${dataRowIndex}`).numFmt = '0.0\%';
          } else {
            // Fallback to static value if formula can't be applied
            visualsSheet.getCell(`C${dataRowIndex}`).value = 0;
            visualsSheet.getCell(`C${dataRowIndex}`).numFmt = '0.0\%';
          }
        } catch (error) {
          console.warn(`Could not apply percentage formula in row ${dataRowIndex}`);
        }
        
        // Simplify visual representation to avoid compatibility issues
        try {
          // Get the percentage value directly 
          const percentCell = visualsSheet.getCell(`C${dataRowIndex}`);
          let barLength = 0;
          
          if (typeof percentCell.value === 'number') {
            // Calculate bar length directly rather than using complex formula
            barLength = Math.round(percentCell.value / 2);
          } else if (percentCell.value && typeof percentCell.value === 'object' && 'formula' in percentCell.value) {
            // Estimate a reasonable bar length as fallback using safer property check
            const budget = Number(visualsSheet.getCell(`B${dataRowIndex}`).value) || 0;
            const totalBudget = Number(visualsSheet.getCell(`B${totalBudgetRow}`).value) || 1;
            barLength = Math.round((budget / totalBudget) * 50);
          }
          
          // Use plain string instead of REPT formula which can cause issues
          visualsSheet.getCell(`D${dataRowIndex}`).value = '█'.repeat(Math.min(40, barLength));
        } catch (error) {
          console.warn(`Could not create visual bar in row ${dataRowIndex}`);
          // Set a safe empty value
          visualsSheet.getCell(`D${dataRowIndex}`).value = '';
        }
        
        // Use category color for the visual cell
        const hex = category.color.replace('#', '');
        visualsSheet.getCell(`D${dataRowIndex}`).font = { color: { argb: 'FF' + hex } };
      });
      
      // Add spending by category with formulas if transactions exist
      if (transactions.length > 0) {
        visualsSheet.addRow([]);
        visualsSheet.addRow(['Actual Spending by Category']);
        visualsSheet.getRow(visualsSheet.rowCount).font = { bold: true, size: 12 };
        visualsSheet.addRow(['Category', 'Spent', 'Budget', '% of Budget', 'Visual', 'Status']);
        
        categories.forEach(category => {
          // Calculate spent amount for reference
          const spent = transactions
            .filter(t => t.category_id === category.id)
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
          
          const dataRowIndex = visualsSheet.rowCount + 1;
          visualsSheet.addRow([
            category.name, 
            spent, 
            category.budget, 
            '', // Will use formula for percentage
            '', // Will use formula for visual
            ''  // Will use formula for status
          ]);
          
          // Use direct calculation instead of formula for percentage
          try {
            const spent = Number(visualsSheet.getCell(`B${dataRowIndex}`).value) || 0;
            const budget = Number(visualsSheet.getCell(`C${dataRowIndex}`).value) || 1; // Avoid division by zero
            
            if (budget > 0) {
              const percentage = (spent / budget) * 100;
              visualsSheet.getCell(`D${dataRowIndex}`).value = percentage;
            } else {
              visualsSheet.getCell(`D${dataRowIndex}`).value = 0;
            }
            visualsSheet.getCell(`D${dataRowIndex}`).numFmt = '0.0\%';
          } catch (error) {
            console.warn(`Could not calculate percentage in row ${dataRowIndex}`);
            visualsSheet.getCell(`D${dataRowIndex}`).value = 0;
            visualsSheet.getCell(`D${dataRowIndex}`).numFmt = '0.0\%';
          }
          
          // Create visual bar directly without formula
          try {
            const percentValue = Number(visualsSheet.getCell(`D${dataRowIndex}`).value) || 0;
            const barLength = Math.min(40, Math.round(percentValue / 2.5));
            visualsSheet.getCell(`E${dataRowIndex}`).value = '█'.repeat(barLength);
          } catch (error) {
            console.warn(`Could not create visual bar in row ${dataRowIndex}`);
            visualsSheet.getCell(`E${dataRowIndex}`).value = '';
          }
          
          // Direct calculation for budget status instead of formula
          try {
            const spent = Number(visualsSheet.getCell(`B${dataRowIndex}`).value) || 0;
            const budget = Number(visualsSheet.getCell(`C${dataRowIndex}`).value) || 0;
            
            // Calculate status directly
            const statusValue = spent > budget ? "Over Budget" : "Under Budget";
            visualsSheet.getCell(`F${dataRowIndex}`).value = statusValue;
            
            // Apply color directly instead of conditional formatting
            visualsSheet.getCell(`F${dataRowIndex}`).font = { 
              color: { argb: spent > budget ? 'FFFF0000' : 'FF008000' } 
            };
          } catch (error) {
            console.warn(`Could not set budget status in row ${dataRowIndex}`);
            visualsSheet.getCell(`F${dataRowIndex}`).value = 'Unknown';
          }
          
          // Color coding for the visual bar
          const hex = category.color.replace('#', '');
          visualsSheet.getCell(`E${dataRowIndex}`).font = { color: { argb: 'FF' + hex } };
        });
        
        // Add a summary row with totals
        const summaryRowIndex = visualsSheet.rowCount + 1;
        visualsSheet.addRow(['TOTALS', '', '', '', '', '']);
        visualsSheet.getRow(summaryRowIndex).font = { bold: true };
        
        // Formula for total spent
        visualsSheet.getCell(`B${summaryRowIndex}`).value = {
          formula: `SUM(B${summaryRowIndex-categories.length}:B${summaryRowIndex-1})`,
          date1904: false
        };
        
        // Formula for total budget
        visualsSheet.getCell(`C${summaryRowIndex}`).value = {
          formula: `SUM(C${summaryRowIndex-categories.length}:C${summaryRowIndex-1})`,
          date1904: false
        };
        
        // Formula for overall percentage
        visualsSheet.getCell(`D${summaryRowIndex}`).value = {
          formula: `B${summaryRowIndex}/C${summaryRowIndex}*100`,
          date1904: false
        };
        visualsSheet.getCell(`D${summaryRowIndex}`).numFmt = '0.0\%';
        
        // Formula for overall status
        visualsSheet.getCell(`F${summaryRowIndex}`).value = {
          formula: `IF(B${summaryRowIndex}>C${summaryRowIndex},"Over Budget","Under Budget")`,
          date1904: false
        };
        
        // Add conditional formatting for overall status
        visualsSheet.addConditionalFormatting({
          ref: `F${summaryRowIndex}`,
          rules: [
            {
              type: 'containsText',
              operator: 'containsText',
              text: 'Over Budget',
              style: { font: { color: { argb: 'FFFF0000' } } }, // red
              priority: 1
            },
            {
              type: 'containsText',
              operator: 'containsText',
              text: 'Under Budget',
              style: { font: { color: { argb: 'FF008000' } } }, // green
              priority: 2
            }
          ]
        });
      }
      
      // Add instructions for users to modify data
      visualsSheet.addRow([]);
      visualsSheet.addRow([]);
      visualsSheet.addRow(['NOTE: You can modify budget values and expense amounts in this workbook.']);
      visualsSheet.addRow(['All charts and calculations will automatically update.']);
      visualsSheet.getRow(visualsSheet.rowCount).font = { italic: true, color: { argb: 'FF666666' } };
      visualsSheet.getRow(visualsSheet.rowCount-1).font = { italic: true, color: { argb: 'FF666666' } };
    }
  }

    // Now generate and download the file
    console.log('Preparing to write Excel buffer...');
    
    try {
      // Write the workbook to buffer with minimal options
      buffer = await workbook.xlsx.writeBuffer({
        useStyles: false,  // Try setting these to false to simplify the export
        useSharedStrings: false
      });
      
      if (!buffer || buffer.byteLength === 0) {
        throw new Error('Excel buffer generation failed - empty or null buffer');
      }
      
      console.log('Buffer generated successfully, size:', buffer.byteLength);
    } catch (bufferError) {
      console.error('Error during Excel buffer generation:', bufferError);
      if (bufferError instanceof Error) {
        console.error('Buffer error name:', bufferError.name);
        console.error('Buffer error message:', bufferError.message);
        console.error('Buffer error stack:', bufferError.stack);
      }
      throw new Error(`Buffer generation failed: ${bufferError instanceof Error ? bufferError.message : 'Unknown buffer error'}`);
    }
    
    // Create variables for download in wider scope
    let url: string;
    let a: HTMLAnchorElement;

    try {
      // Create download blob with explicit MIME type
      console.log('Creating blob from buffer...');
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('Blob created successfully, size:', blob.size);
      
      // Create download URL
      console.log('Creating object URL...');
      url = window.URL.createObjectURL(blob);
      console.log('URL created successfully:', url.substring(0, 30) + '...');
      
      // Create a link element and trigger download
      console.log('Setting up download link...');
      a = document.createElement('a');
      a.href = url;
      a.download = exportOptions.fileName || `${budget.name || 'Budget'}-Export.xlsx`;
      console.log('Download filename:', a.download);
    } catch (blobError) {
      console.error('Error creating download blob:', blobError);
      throw new Error(`Download preparation failed: ${blobError instanceof Error ? blobError.message : 'Unknown blob error'}`);
    }

    try {
      console.log('Appending and clicking download link...');
      document.body.appendChild(a);
      a.click();
      
      // Clean up with delay to ensure download starts
      const urlToRevoke = url; // Copy to avoid closure issues
      const elementToRemove = a; // Copy to avoid closure issues
      
      setTimeout(() => {
        try {
          console.log('Cleaning up download resources...');
          window.URL.revokeObjectURL(urlToRevoke);
          document.body.removeChild(elementToRemove);
          console.log('Download resources cleaned up successfully');
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
          // Don't throw here as the download may have already started
        }
      }, 500); // Increase timeout to ensure download has time to start
      
      console.log('Excel file download triggered successfully');
      return true; // Success indicator
    } catch (downloadError) {
      console.error('Error triggering download:', downloadError);
      throw new Error(`Download failed: ${downloadError instanceof Error ? downloadError.message : 'Unknown download error'}`);
    }
  } catch (error) {
    // Log detailed error information
    console.error('Error generating Excel file:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log additional context info
    console.error('Export context:', { 
      budgetName: budget?.name || 'unknown',
      hasCategories: Array.isArray(categories) && categories.length > 0,
      hasTransactions: Array.isArray(transactions) && transactions.length > 0,
      hasForecast: Array.isArray(forecastData) && forecastData.length > 0,
      workbookCreated: workbook !== null,
      bufferGenerated: buffer !== null
    });
    
    throw new Error(`Failed to export Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
