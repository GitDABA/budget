import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CategoryWithSpent, ForecastData } from './BudgetTypes';
import { formatCurrency } from './BudgetCalculations';

interface ForecastViewProps {
  categories: CategoryWithSpent[];
  forecast: ForecastData[];
  totalBudget: number;
}

const ForecastView: React.FC<ForecastViewProps> = ({
  categories,
  forecast,
  totalBudget
}) => {
  // Get visible categories
  const visibleCategories = categories.filter(category => category.visible);
  
  // Add totalBudget to each month in the forecast data for the chart
  const forecastWithTotalBudget = forecast.map(month => ({
    ...month,
    totalBudget: totalBudget // Add totalBudget to each month
  }));
  
  // Calculate the month when budget will reach zero
  const zeroMonthIndex = calculateZeroMonthIndex(forecast);

  return (
    <div className="space-y-6">
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Årlig budsjettprognose</h2>
          <div className="flex flex-col items-end">
            <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Totalt budsjett</span>
            <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{formatCurrency(totalBudget)}</span>
          </div>
        </div>
        
        {/* Cumulative Spending Chart */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Akkumulerte utgifter vs budsjett</h3>
            <div className="text-sm bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 rounded text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">Prognose</div>
          </div>
          
          {/* Key budget statistics */}
          <div className="flex justify-between mb-4 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
            <div className="text-center px-4">
              <div className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-1">Totalt budsjett</div>
              <div className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">{formatCurrency(totalBudget)}</div>
            </div>
            <div className="text-center px-4 border-x border-gray-200 dark:border-gray-700">
              <div className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-1">Akkumulerte utgifter</div>
              <div className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
                {forecast.length > 0 ? formatCurrency(forecast[currentMonth]?.cumulative || 0) : formatCurrency(0)}
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-1">Gjenstående budsjett</div>
              <div className={`text-lg font-semibold ${(forecast.length > 0 && (forecast[currentMonth]?.remaining || 0) < 0) ? 'text-danger-600 dark:text-danger-400' : 'text-text-light-primary dark:text-text-dark-primary'}`}>
                {forecast.length > 0 ? formatCurrency(forecast[currentMonth]?.remaining || 0) : formatCurrency(totalBudget)}
              </div>
            </div>
          </div>
          
          <div className="h-80 dark:bg-[#2A2A2A] bg-white rounded-xl shadow-lg dark:shadow-slate-900/20 overflow-hidden border border-gray-200 dark:border-slate-800 p-2 transition-all duration-200">
            {/* Custom legend positioned at top */}
            <div className="flex items-center justify-center gap-6 py-2 px-2 text-xs font-medium bg-white/5 dark:bg-[#1e1e1e] rounded border-b border-slate-200 dark:border-slate-800/50">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                <span>Akkumulerte utgifter</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
                <span>Gjenstående budsjett</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400 mr-2"></div>
                <span>Totalt budsjett</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={forecastWithTotalBudget}
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                className="dark:bg-transparent rounded-lg overflow-hidden"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--text-primary)' }}
                  axisLine={{ stroke: 'var(--border-color)', strokeWidth: 1 }}
                  tickLine={{ stroke: 'var(--border-color)' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${Math.round(value / 1000)} 000 kr`}
                  tick={{ fill: 'var(--text-primary)' }}
                  axisLine={{ stroke: 'var(--border-color)', strokeWidth: 1 }}
                  tickLine={{ stroke: 'var(--border-color)' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    const val = Number(value);
                    let label = '';
                    if (name === 'cumulative') label = 'Akkumulerte utgifter';
                    else if (name === 'remaining') label = 'Gjenstående budsjett';
                    else if (name === 'totalBudget') label = 'Totalt budsjett';
                    return [formatCurrency(val), label];
                  }}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                
                {/* Reference line for zero */}
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                
                {/* Total budget line (constant) */}
                <Line 
                  type="monotone" 
                  dataKey="totalBudget" 
                  name="Totalt budsjett" 
                  stroke="#F9C74F" /* yellow */
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="4 4"
                />
                
                {/* Remaining budget line */}
                <Line 
                  type="monotone" 
                  dataKey="remaining" 
                  name="Gjenstående budsjett" 
                  stroke="#4BC0C0" /* green */
                  strokeWidth={2}
                  activeDot={{ r: 6, stroke: '#4BC0C0', strokeWidth: 2, fill: '#fff' }}
                />
                
                {/* Cumulative spending */}
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Akkumulerte utgifter" 
                  stroke="#5570F6" /* blue */
                  strokeWidth={2}
                  activeDot={{ r: 6, stroke: '#5570F6', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Monthly Spending by Category Chart */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Månedlige utgifter per kategori</h3>
            <div className="text-sm bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 rounded text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">Fordeling</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={forecast}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                className="dark:bg-transparent rounded-lg overflow-hidden"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--text-primary)' }}
                  axisLine={{ stroke: 'var(--border-color)', strokeWidth: 1 }}
                  tickLine={{ stroke: 'var(--border-color)' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${Math.round(value / 1000)} 000 kr`}
                  tick={{ fill: 'var(--text-primary)' }}
                  axisLine={{ stroke: 'var(--border-color)', strokeWidth: 1 }}
                  tickLine={{ stroke: 'var(--border-color)' }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend />
                {visibleCategories.map((category, index) => (
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
      </div>

      {/* Monthly Forecast Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-card-light dark:shadow-card-dark p-6 transition-colors duration-200 w-full overflow-x-auto">
        <h3 className="font-medium mb-4 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">Månedlig prognose</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Måned</th>
                {visibleCategories.map(category => (
                  <th key={category.id} className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">
                    {category.name}
                  </th>
                ))}
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Total</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Kumulativ</th>
                <th className="py-3 text-left text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-200">Gjenstående</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {forecast.map((month, index) => (
                <tr 
                  key={month.name} 
                  className={`${index === currentMonth ? 'bg-primary-50 dark:bg-primary-900/20' : index === zeroMonthIndex ? 'bg-danger-50 dark:bg-danger-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} transition-colors duration-200`}
                >
                  <td className="py-2 text-text-light-primary dark:text-text-dark-primary transition-colors duration-200">
                    {month.name}
                    {index === currentMonth && (
                      <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded transition-colors duration-200">
                        Nå
                      </span>
                    )}
                    {index === zeroMonthIndex && (
                      <span className="ml-2 text-xs bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300 px-2 py-0.5 rounded transition-colors duration-200">
                        Budsjett tom
                      </span>
                    )}
                  </td>
                  {visibleCategories.map(category => (
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
  );
};

// Current month for highlighting in the table
const currentMonth = new Date().getMonth();

// Calculate the month when budget will reach zero (for forecasting)
const calculateZeroMonthIndex = (forecast: ForecastData[]) => {
  for (let i = 0; i < forecast.length; i++) {
    if ((forecast[i].remaining ?? 0) <= 0) {
      return i;
    }
  }
  return -1; // Budget never reaches zero
};

export default ForecastView;
