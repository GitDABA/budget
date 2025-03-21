/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Standardized background colors
        concrete: '#E5E5E5', // Lighter grey
        'dark-grey': '#2A2A2A', // Very dark grey for better contrast in dark mode
        'regal-blue': '#004666', // Primary header color
        orient: '#006384',
        
        // Theme-aware backgrounds
        background: {
          light: '#FFFFFF',
          DEFAULT: '#FFFFFF',
          dark: '#1A1A1A', // Even darker background for better contrast
        },
        card: {
          light: '#FFFFFF',
          DEFAULT: '#FFFFFF',
          dark: '#232323', // Darker card background for better contrast
        },
        paper: {
          light: '#E5E5E5', // Updated concrete color
          DEFAULT: '#E5E5E5',
          dark: '#2A2A2A', // Very dark grey for better contrast
        },
        panel: {
          light: '#E5E5E5', // Updated concrete color
          DEFAULT: '#E5E5E5',
          dark: '#2A2A2A', // Very dark grey for better contrast
        },
        input: {
          light: '#ffffff',
          DEFAULT: '#ffffff',
          dark: '#1f2937', // Slightly dark gray
          border: {
            light: '#d1d5db',
            DEFAULT: '#d1d5db',
            dark: '#4b5563', // Medium-dark gray
          }
        },
        // Update to use Regal Blue as the primary color
        primary: {
          50: '#f0f7ff',  // Lightest blue, for backgrounds
          100: '#e0f0ff', // Light blue for hover states
          200: '#bae0ff', // Lighter blue for active states
          300: '#91c8ff', // Light blue for secondary elements
          400: '#60a5fa', // Medium blue for accent elements
          500: '#3b82f6', // Primary blue color (slightly less saturated than before)
          600: '#004666', // Regal Blue - Primary color for buttons and important elements
          700: '#003a54', // Darker Regal Blue for hover states on primary buttons
          800: '#003047', // Even darker blue for active states
          900: '#00253a', // Darkest blue, for text on light backgrounds
        },
        secondary: {
          50: '#eef2ff',  // Very light indigo for backgrounds
          100: '#e0e7ff', // Light indigo for hover states
          200: '#c7d2fe', // Lighter indigo
          300: '#a5b4fc', // Secondary indigo color
          400: '#818cf8', // Medium indigo
          500: '#6366f1', // Primary indigo color
          600: '#4f46e5', // Darker indigo
          700: '#4338ca', // Even darker indigo
          800: '#3730a3', // Very dark indigo
          900: '#312e81', // Darkest indigo
        },
        success: {
          50: '#f0fdf4',  // Very light green
          100: '#dcfce7', // Light green
          200: '#bbf7d0', // Lighter green
          300: '#86efac', // Light success green
          400: '#4ade80', // Medium success green
          500: '#22c55e', // Primary success green
          600: '#16a34a', // Darker success green
          700: '#15803d', // Even darker success green
          800: '#166534', // Very dark success green
          900: '#14532d', // Darkest success green
        },
        warning: {
          50: '#fffbeb',  // Very light amber
          100: '#fef3c7', // Light amber
          200: '#fde68a', // Lighter amber
          300: '#fcd34d', // Light warning amber
          400: '#fbbf24', // Medium warning amber
          500: '#f59e0b', // Primary warning amber
          600: '#d97706', // Darker warning amber
          700: '#b45309', // Even darker warning amber
          800: '#92400e', // Very dark warning amber
          900: '#78350f', // Darkest warning amber
        },
        danger: {
          50: '#fef2f2',  // Very light red
          100: '#fee2e2', // Light red
          200: '#fecaca', // Lighter red
          300: '#fca5a5', // Light danger red
          400: '#f87171', // Medium danger red
          500: '#ef4444', // Primary danger red
          600: '#dc2626', // Darker danger red
          700: '#b91c1c', // Even darker danger red
          800: '#991b1b', // Very dark danger red
          900: '#7f1d1d', // Darkest danger red
        },
        gray: {
          50: '#f9fafb',  // Lightest gray
          100: '#f3f4f6', // Very light gray
          200: '#e5e7eb', // Light gray for borders
          300: '#d1d5db', // Light gray for disabled elements
          400: '#9ca3af', // Medium gray for placeholder text
          500: '#6b7280', // Medium gray for secondary text
          600: '#4b5563', // Darker gray for primary text
          700: '#374151', // Dark gray for headings
          800: '#1f2937', // Very dark gray for dark mode elements
          900: '#111827', // Darkest gray, almost black
        },
        text: {
          light: {
            primary: '#111827',   // Very dark gray, almost black
            secondary: '#4b5563', // Darker gray
            muted: '#6b7280',     // Medium gray
            disabled: '#9ca3af',  // Light-medium gray
          },
          dark: {
            primary: '#f9fafb',   // Nearly white
            secondary: '#e5e7eb', // Very light gray
            muted: '#9ca3af',     // Medium gray
            disabled: '#6b7280',  // Medium-dark gray
          }
        },
        // Keep blue, green, red for backward compatibility
        blue: {
          50: '#f0f7ff',
          100: '#e0f0ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8', 
          800: '#1e40af',
          900: '#1e3a8a',
        },
        green: {
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
        },
      },
      // Custom shadows
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)',
        'button-light': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'button-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'dropdown-light': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dropdown-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};
