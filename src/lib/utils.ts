import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and merges Tailwind classes with tailwind-merge
 * This helps prevent class conflicts when using dynamic class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency value
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'NOK')
 * @param locale - The locale to use for formatting (default: 'no-NO')
 */
export function formatCurrency(value: number, currency = 'NOK', locale = 'no-NO') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
}

/**
 * Generates a random hex color
 */
export function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Calculates the percentage of two numbers
 * @param value - The current value
 * @param total - The total value
 * @param decimals - Number of decimal places (default: 1)
 */
export function calculatePercentage(value: number, total: number, decimals = 1) {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Debounces a function
 * @param func - The function to debounce
 * @param wait - The wait time in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Formats a date string
 * @param dateString - The date string to format
 * @param format - The format to use: 'short', 'medium', 'long', 'relative'
 */
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' | 'relative' = 'medium') {
  const date = new Date(dateString);
  
  if (format === 'relative') {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSecs < 60) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
  }
  
  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'short':
      options = { day: 'numeric', month: 'short' };
      break;
    case 'medium':
      options = { day: 'numeric', month: 'short', year: 'numeric' };
      break;
    case 'long':
      options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      break;
    default:
      options = { day: 'numeric', month: 'short' };
  }
  
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}
