/**
 * Utility functions for generating dynamic styles
 */

/**
 * Creates a dynamic style attribute for progress bars based on percentage
 * @param percentage The width percentage (0-100)
 * @returns A string containing the appropriate Tailwind classes
 */
export const getProgressBarStyle = (percentage: number): string => {
  // Ensure percentage is a number and between 0-100
  const validPercentage = Math.min(100, Math.max(0, 
    typeof percentage === 'string' ? parseFloat(percentage) : percentage));
  
  // Return appropriate classes based on percentage ranges
  // This approach avoids inline styles by using predefined width classes
  if (validPercentage <= 0) return 'w-0';
  if (validPercentage <= 5) return 'w-[5%]';
  if (validPercentage <= 10) return 'w-[10%]';
  if (validPercentage <= 15) return 'w-[15%]';
  if (validPercentage <= 20) return 'w-[20%]';
  if (validPercentage <= 25) return 'w-[25%]';
  if (validPercentage <= 30) return 'w-[30%]';
  if (validPercentage <= 33) return 'w-1/3';
  if (validPercentage <= 40) return 'w-[40%]';
  if (validPercentage <= 45) return 'w-[45%]';
  if (validPercentage <= 50) return 'w-1/2';
  if (validPercentage <= 60) return 'w-[60%]';
  if (validPercentage <= 66) return 'w-2/3';
  if (validPercentage <= 70) return 'w-[70%]';
  if (validPercentage <= 75) return 'w-3/4';
  if (validPercentage <= 80) return 'w-4/5';
  if (validPercentage <= 90) return 'w-[90%]';
  if (validPercentage <= 95) return 'w-[95%]';
  return 'w-full';
};

/**
 * Create a background color style from a color string
 * @param color The color value (hex, rgb, etc)
 * @returns A string containing the appropriate Tailwind class or style attribute
 */
export const getBackgroundColorStyle = (color: string): string => {
  // If color is undefined or null, return a default color
  if (!color) return 'bg-gray-500 dark:bg-gray-600';
  // If it's a standard CSS color name that Tailwind has classes for, use those
  const tailwindColors: Record<string, string> = {
    'red': 'bg-danger-500 dark:bg-danger-600',
    'blue': 'bg-primary-500 dark:bg-primary-600',
    'green': 'bg-success-500 dark:bg-success-600',
    'yellow': 'bg-warning-500 dark:bg-warning-600',
    'purple': 'bg-purple-500 dark:bg-purple-600',
    'pink': 'bg-pink-500 dark:bg-pink-600',
    'indigo': 'bg-indigo-500 dark:bg-indigo-600',
    'gray': 'bg-gray-500 dark:bg-gray-600',
    // Add more mappings as needed
  };

  // Check if it's a basic color name
  if (color.toLowerCase() in tailwindColors) {
    return tailwindColors[color.toLowerCase()];
  }
  
  // For hex colors or RGB values, we need to use Tailwind's arbitrary value syntax
  // We'll still return this but ideally all colors should use the design system
  return `bg-[${color || '#ccc'}] dark:bg-opacity-90`;
};

/**
 * Get the appropriate CSS class for tooltip color indicators based on hex color value
 * @param hexColor - Hex color code
 * @returns CSS class name for the color indicator
 */
export const getTooltipColorClass = (hexColor: string): string => {
  if (!hexColor) return '';
  const normalizedColor = hexColor.toLowerCase().replace('#', '');
  const colorMap: Record<string, string> = {
    '5570f6': 'tooltip-color-blue',
    '0088fe': 'tooltip-color-blue',
    '6366f1': 'tooltip-color-indigo',
    '00c49f': 'tooltip-color-green',
    '10b981': 'tooltip-color-green',
    '14b8a6': 'tooltip-color-teal',
    '4ecdc4': 'tooltip-color-cyan',
    'ffbb28': 'tooltip-color-yellow',
    'f59e0b': 'tooltip-color-yellow',
    'ff8042': 'tooltip-color-orange',
    'f97316': 'tooltip-color-orange',
    'ff6b6b': 'tooltip-color-red',
    'ef4444': 'tooltip-color-red',
    'ec4899': 'tooltip-color-pink',
    'a28bff': 'tooltip-color-purple',
    '8b5cf6': 'tooltip-color-purple',
  };
  return colorMap[normalizedColor] || '';
};
