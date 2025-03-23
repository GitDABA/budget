'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { AnimatedContainer } from './animatedcontainer';
import { useTheme } from '@/contexts/ThemeContext';

// Types
type DataItem = {
  name: string;
  value: number;
  color?: string;
};

interface AnimatedPieChartProps {
  data: DataItem[];
  height?: number;
  width?: number;
  innerRadius?: number;
  outerRadius?: number;
  delay?: number;
  colors?: string[];
  showLabels?: boolean;
  showTooltip?: boolean;
  activeIndex?: number;
  setActiveIndex?: (index: number) => void;
  // Additional props used in BudgetDashboard
  valuePrefix?: string;
  valueFormatter?: (value: number) => string;
  onSliceClick?: (item: any) => void;
  emptyMessage?: string;
  legendPosition?: string;
}

export const AnimatedPieChart = ({
  data = [],
  height = 240,
  width = 280,
  innerRadius = 60,
  outerRadius = 80,
  delay = 0,
  colors,
  showLabels = false,
  showTooltip = true,
  activeIndex: controlledActiveIndex,
  setActiveIndex: setControlledActiveIndex,
  // New props
  valuePrefix = '$',
  valueFormatter = (value: number) => value.toString(),
  onSliceClick = () => {},
  emptyMessage = 'No data available',
  legendPosition = 'right'
}: AnimatedPieChartProps) => {
  const [localActiveIndex, setLocalActiveIndex] = useState<number | undefined>(undefined);
  const { theme } = useTheme();
  
  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : localActiveIndex;
  const setActiveIndex = setControlledActiveIndex || setLocalActiveIndex;

  const defaultColors = theme === 'dark' 
    ? ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#a855f7', '#ec4899'] 
    : ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#a855f7', '#ec4899'];
  
  const chartColors = colors || defaultColors;

  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, name 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">{`${payload.name}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`${value.toLocaleString()}`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const handleSliceClick = (data: any) => {
    if (onSliceClick) {
      onSliceClick(data);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center text-muted-foreground"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <AnimatedContainer delay={delay} variant="fadeIn" className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onClick={handleSliceClick}
            label={showLabels ? renderCustomizedLabel : undefined}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>
    </AnimatedContainer>
  );
};

export default AnimatedPieChart;
