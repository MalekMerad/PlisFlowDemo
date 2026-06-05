import React from 'react';

const LoadingState = () => {
  return (
    <div className="p-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-500 dark:text-slate-400 text-sm italic font-medium">
          Chargement des détails de l'opération...
        </span>
      </div>
    </div>
  );
};

export default LoadingState;
