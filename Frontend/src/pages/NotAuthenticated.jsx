import React from 'react';

const NotAuthenticated = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-xl text-center border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Non authentifié</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          Vous devez être connecté pour accéder à cette page sécurisée.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          Se connecter
        </a>
      </div>
    </div>
  );
};

export default NotAuthenticated;
