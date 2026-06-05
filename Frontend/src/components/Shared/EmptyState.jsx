import React from 'react';
import { Award } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-8 text-center shadow-sm">
      <Award className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
      <p className="text-sm text-gray-500 dark:text-slate-400">Aucune évaluation enregistrée</p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Ajoutez une évaluation en utilisant le formulaire</p>
    </div>
  );
};

export default EmptyState;