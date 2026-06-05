import React from 'react';

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-xl text-center border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Page non trouvée</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          Oups ! La page que vous cherchez n’existe pas ou a été déplacée vers un autre univers.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          Retour à l’accueil
        </a>
      </div>
    </div>
  );
}

export default NotFound;