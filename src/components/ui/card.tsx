import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return <h3 className={`text-xl font-semibold text-gray-800 dark:text-white ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => {
  return <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>{children}</p>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end ${className}`}>
      {children}
    </div>
  );
};
