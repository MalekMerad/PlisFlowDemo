import React, { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const DROPDOWN_MAX_HEIGHT = 250;

const SearchableDropdown = ({ options, value, onChange, placeholder, renderOption, filterFn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(
        () => options.filter(option => filterFn(option, searchTerm)),
        [options, searchTerm, filterFn]
    );

    const selectOption = (option) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative w-full">
            <button
                type="button"
                className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded bg-white dark:bg-slate-800 text-left flex justify-between items-center text-[10px] font-medium text-slate-700 dark:text-slate-200 transition-colors focus:ring-1 focus:ring-slate-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value ? (
                    <span className="truncate">{renderOption(value)}</span>
                ) : (
                    <span className="text-gray-400 dark:text-slate-500 italic">{placeholder}</span>
                )}
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div
                    className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded shadow-xl text-[10px] overflow-hidden animate-in fade-in zoom-in duration-100"
                    style={{ maxHeight: DROPDOWN_MAX_HEIGHT, overflowY: 'auto', minWidth: '100%' }}
                >
                    <div className="p-1 sticky top-0 bg-white dark:bg-slate-900 z-20 border-b border-gray-100 dark:border-slate-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full border border-gray-200 dark:border-slate-700 px-2 py-1.5 rounded pl-7 text-[10px] bg-gray-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        </div>
                    </div>
                    <ul className="divide-y divide-gray-50 dark:divide-slate-800">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-2 text-gray-400 dark:text-slate-500 italic cursor-default select-none">
                                Aucun résultat trouvé
                            </li>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={typeof option === 'object' && option.id !== undefined ? option.id : index}
                                    className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                                    onClick={() => selectOption(option)}
                                >
                                    {renderOption(option)}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;