import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ searchTerm, setSearchTerm, placeholder }) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl w-75 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none transition-all"
      />
    </div>
  );
}