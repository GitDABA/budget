import React, { Fragment, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open = false, 
  onOpenChange, 
  children 
}) => {
  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange?.(false)}
          />
          
          {/* Dialog content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto">{children}</div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
};

export const DialogContent: React.FC<{ 
  children: ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-auto relative ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<{ 
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<{ 
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h2>
  );
};

export const DialogDescription: React.FC<{ 
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <p className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
};

export const DialogFooter: React.FC<{ 
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
};
