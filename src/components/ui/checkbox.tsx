import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer h-4 w-4 opacity-0 absolute"
          {...props}
        />
        <div
          className={`h-5 w-5 rounded border border-gray-300 dark:border-gray-600 
           flex items-center justify-center 
           ${checked 
              ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500' 
              : 'bg-white dark:bg-gray-700'
           } 
           ${className || ''}`}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
