'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { AnimatedContainer } from './AnimatedContainer';
import { useTheme } from '@/contexts/ThemeContext';

// Types
type DataItem = {
  name: string;
  value: number;
  color?: string;
};

type AnimatedBarChartProps = {
  data: DataItem[];
  title?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  emptyMessage?: string;
  valueFormatter?: (value: number) => string;
  onBarClick?: (item: DataItem) => void;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  barSize?: number;
  layout?: 'vertical' | 'horizontal';
  dataKey?: string;
};

// Default colors if no colors are provided
const DEFAULT_COLORS = [
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
];

export function AnimatedBarChart({
  data = [],
  title,
  height = 300,
  valuePrefix = '',
  valueSuffix = '',
  className = '',
  emptyMessage = 'No data available',
  valueFormatter,
  onBarClick,
  horizontal = false,
  showGrid = true,
  showLegend = false,
  barSize = 30,
  layout = 'vertical',
  dataKey = 'value',
}: AnimatedBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<DataItem[]>([]);
  const { theme } = useTheme();

  // Format data for Recharts based on provided dataKey
  const formattedData = data.map(item => ({
    name: item.name,
    [dataKey]: item.value,
    color: item.color,
  }));

  // Animate in the data
  useEffect(() => {
    setAnimatedData([]);
    
    // Create a delay for each data item to animate in sequence
    formattedData.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item as DataItem]);
      }, 70 * index);
    });
  }, [formattedData]);

  const onMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onMouseLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600 dark:text-white">
            {valueFormatter 
              ? valueFormatter(value) 
              : `${valuePrefix}${value.toLocaleString()}${valueSuffix}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data or all values are 0, show empty state
  if (!data.length || data.every(item => item.value === 0)) {
    return (
      <div className={`flex flex-col items-center justify-center h-${height} ${className}`}>
        <p className="text-gray-500 dark:text-white">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <AnimatedContainer className={`w-full ${className}`} variant="fadeIn">
      {title && (
        <motion.h3 
          className="text-lg font-medium mb-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
      )}
      <div className="relative" style={{ 
        height: height,
        backgroundColor: theme === 'dark' ? '#2A2A2A' : '#f3f4f6',
        borderRadius: '0.5rem',
        padding: '0.5rem' 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={animatedData}
            layout={layout}
            margin={{
              top: 20,
              right: 20,
              left: 30,
              bottom: 30,
            }}
            barSize={barSize}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
            <XAxis 
              dataKey={layout === 'vertical' ? 'name' : undefined}
              type={layout === 'vertical' ? 'category' : 'number'}
              axisLine={{ stroke: theme === 'dark' ? '#4b5563' : '#e2e8f0', strokeWidth: 1 }} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#ffffff' }}
              tickMargin={8}
              angle={layout === 'vertical' ? -45 : 0}
              textAnchor={layout === 'vertical' ? 'end' : 'middle'}
              height={60}
            />
            <YAxis 
              type={layout === 'vertical' ? 'number' : 'category'}
              dataKey={layout === 'horizontal' ? 'name' : undefined}
              axisLine={{ stroke: theme === 'dark' ? '#4b5563' : '#e2e8f0', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#ffffff' }}
              tickFormatter={
                layout === 'vertical' 
                  ? (value) => valueFormatter 
                    ? valueFormatter(value) 
                    : `${valuePrefix}${value.toLocaleString()}${valueSuffix}`
                  : undefined
              }
              width={layout === 'horizontal' ? 100 : 60}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: theme === 'dark' ? 'rgba(50, 50, 50, 0.7)' : 'rgba(224, 231, 255, 0.2)' }} 
            />
            {showLegend && <Legend />}
            <Bar
              dataKey={dataKey}
              animationDuration={1000}
              animationEasing="ease-out"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onClick={(data, index) => {
                if (onBarClick && animatedData[index]) {
                  onBarClick(animatedData[index] as DataItem);
                }
              }}
              className="cursor-pointer"
              radius={[4, 4, 0, 0]}
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  opacity={activeIndex === index ? 0.9 : 0.7}
                  className="transition-opacity hover:opacity-100"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnimatedContainer>
  );
}

export default AnimatedBarChart;
