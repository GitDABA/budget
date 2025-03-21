import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// Types and interfaces
interface SelectProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

// Context to share state between select components
const SelectContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({
  value: '',
  setValue: () => {},
  open: false,
  setOpen: () => {},
});

// Main Select component
export const Select: React.FC<SelectProps> = ({
  children,
  defaultValue = '',
  onValueChange,
  disabled = false,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value,
        setValue: handleValueChange,
        open,
        setOpen,
        onValueChange,
        disabled,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
};

// SelectTrigger component
export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = '',
}) => {
  const { open, setOpen, disabled } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      className={`flex items-center justify-between w-full px-3 py-2 text-sm 
                border border-gray-300 dark:border-gray-600 rounded-md 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
                ${className}`}
      disabled={disabled}
      aria-expanded={open}
    >
      {children}
      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
};

// SelectValue component
export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = 'Select an option',
}) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
      {value || placeholder}
    </span>
  );
};

// SelectContent component
export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = '',
}) => {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 
                  rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
      role="listbox"
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

// SelectItem component
export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  disabled = false,
  className = '',
}) => {
  const { value: selectedValue, setValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`flex items-center px-3 py-2 text-sm 
                  ${isSelected ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 
                    'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${className}`}
      onClick={() => {
        if (!disabled) {
          setValue(value);
        }
      }}
    >
      <span className="flex-grow">{children}</span>
      {isSelected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
    </div>
  );
};
