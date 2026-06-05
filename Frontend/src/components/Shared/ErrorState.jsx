import React from 'react';

const ErrorState = ({ message, onBack }) => {
  return (
    <div className="p-8 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-lg">
      <span className="text-red-600 dark:text-red-400 text-sm mb-4">{message}</span>
      <button
        onClick={onBack}
        className="px-4 py-2 bg-slate-700 dark:bg-slate-800 text-white hover:bg-slate-600 dark:hover:bg-slate-700 rounded text-xs font-medium transition-colors"
      >
        Retour
      </button>
    </div>
  );
};

export default ErrorState;
