import React from 'react';
import { motion } from 'framer-motion';

type TabId = 'overview' | 'manage' | 'forecast';

interface Tab {
  id: TabId;
  label: string;
}

interface TabsContainerProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  children: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Oversikt' },
  { id: 'manage', label: 'Administrer' },
  { id: 'forecast', label: 'Prognose' }
];

const TabsContainer: React.FC<TabsContainerProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md border border-gray-200 dark:border-gray-800 dark:shadow-card-dark relative overflow-hidden transition-colors duration-200">
      <div className="flex border-b border-border-light dark:border-border-dark">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default TabsContainer;
