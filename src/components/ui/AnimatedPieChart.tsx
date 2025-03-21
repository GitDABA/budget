'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { AnimatedContainer } from './AnimatedContainer';
import { useTheme } from '@/contexts/ThemeContext';

// Types
type DataItem = {
  name: string;
  value: number;
  color?: string;
  percent?: number;
};

type AnimatedPieChartProps = {
  data: DataItem[];
  title?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  legendPosition?: 'right' | 'bottom';
  className?: string;
  emptyMessage?: string;
  valueFormatter?: (value: number) => string;
  onSliceClick?: (item: DataItem) => void;
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

const COLORS = DEFAULT_COLORS;

const renderActiveShape = (props: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: DataItem;
  value: number;
  percent?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  valueFormatter?: (value: number) => string;
}) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, valuePrefix, valueSuffix, valueFormatter
  } = props;

  const formattedValue = valueFormatter 
    ? valueFormatter(value)
    : `${valuePrefix || ''}${value.toLocaleString()}${valueSuffix || ''}`;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export function AnimatedPieChart({
  data = [],
  title,
  height = 300,
  valuePrefix = '',
  valueSuffix = '',
  legendPosition = 'right',
  className = '',
  emptyMessage = 'No data available',
  valueFormatter,
  onSliceClick,
}: AnimatedPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<DataItem[]>([]);
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Calculate percentages for each item
  const dataWithPercentages = data.map(item => ({
    ...item,
    percent: totalValue > 0 ? (item.value / totalValue) * 100 : 0
  }));

  // Animate in the data
  useEffect(() => {
    setAnimatedData([]);
    
    // Create a delay for each data item to animate in sequence
    dataWithPercentages.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, 100 * index);
    });
  }, [dataWithPercentages]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-white">
            {valueFormatter 
              ? valueFormatter(data.value) 
              : `${valuePrefix}${data.value.toLocaleString()}${valueSuffix}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-white">
            {(data.percent || 0).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data or all values are 0, show empty state
  if (!data.length || totalValue === 0) {
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
      }} ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              innerRadius={50}
              stroke="none"
              dataKey="value"
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={(props: any) => renderActiveShape({
                ...props, 
                valuePrefix, 
                valueSuffix,
                valueFormatter
              })}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={(_, index) => {
                if (onSliceClick && animatedData[index]) {
                  onSliceClick(animatedData[index]);
                }
              }}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                  className="hover:opacity-90 cursor-pointer transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className={`grid ${legendPosition === 'right' ? 'grid-cols-1 md:grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'} mt-4`}>
          {dataWithPercentages.map((entry, index) => (
            <motion.div 
              key={`legend-${index}`}
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.05), duration: 0.3 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => onSliceClick && onSliceClick(entry)}
            >
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} 
              />
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-40" title={entry.name}>
                  {entry.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-white">
                  {valueFormatter 
                    ? valueFormatter(entry.value) 
                    : `${valuePrefix}${entry.value.toLocaleString()}${valueSuffix}`} 
                  ({entry.percent?.toFixed(1)}%)
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default AnimatedPieChart;
