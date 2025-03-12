import React, { useState } from 'react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: number) => void;
  initialBudget: number;
}

const SetupModal: React.FC<SetupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialBudget 
}) => {
  const [budget, setBudget] = useState(initialBudget);
  const currentYear = new Date().getFullYear();

  if (!isOpen) return null;

  const handleSave = () => {
    if (budget <= 0) {
      alert('Vennligst angi et gyldig budsjettbeløp');
      return;
    }
    onSave(budget);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 max-w-md w-full shadow-dropdown-light dark:shadow-dropdown-dark transition-colors duration-200">
        <h2 className="text-xl font-bold mb-4 text-text-light-primary dark:text-text-dark-primary">Oppsett av budsjett</h2>
        <p className="mb-4 text-text-light-secondary dark:text-text-dark-secondary">Velkommen til budsjettplanleggeren! Vennligst sett opp ditt totalbudsjett for å komme i gang.</p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-text-light-primary dark:text-text-dark-primary">Totalbudsjett for {currentYear}</label>
          <input 
            type="number" 
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="border rounded px-3 py-2 w-full bg-input-light dark:bg-input-dark border-input-border-light dark:border-input-border-dark focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
            placeholder="Angi totalbudsjett"
            aria-label="Enter total budget amount"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-text-light-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            onClick={onClose}
          >
            Avbryt
          </button>
          <button 
            className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-600 shadow-button-light dark:shadow-button-dark focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
            aria-label="Lagre budsjett"
            onClick={handleSave}
          >
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;
