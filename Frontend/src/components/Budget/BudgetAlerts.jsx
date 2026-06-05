import React from 'react';
import { CircleDollarSign, X } from 'lucide-react';

const BudgetAlerts = ({ errorMessage, setErrorMessage, isOverBudget }) => {
  return (
    <div className="space-y-4">
      {/* Yellow Alert Banner (Amber Styling) - for manual validation errors */}
      {errorMessage && (
        <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4 rounded shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
              <CircleDollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200 transition-colors p-1"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Budget Overload Warning (Shown automatically when state is over budget) */}
      {isOverBudget && !errorMessage && (
        <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4 rounded shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
            <CircleDollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Le paiement n'est pas complet : le budget consommé dépasse le budget alloué (AP)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAlerts;
