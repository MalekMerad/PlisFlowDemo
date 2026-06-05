import React from 'react';
import { Filter, CheckCircle, Archive, Clock, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DropDownFilter = ({
  filterStatus,
  setFilterStatus,
  showFilterDropdown,
  setShowFilterDropdown,
  operations = [],
  fadeOutOps = {},
}) => {
  const { t } = useTranslation();

  const statusFilterList = [
    {
      value: 1,
      label: t('status.active'),
      icon: CheckCircle,
      activeColor: 'text-blue-700 dark:text-blue-300',
      activeBg: 'bg-blue-50 dark:bg-blue-900/30',
      activeIcon: 'text-blue-600 dark:text-blue-400',
      inactiveIcon: 'text-gray-300 dark:text-slate-600',
      hover: 'hover:bg-blue-50 dark:hover:bg-slate-800',
      focus: 'focus:bg-blue-100 dark:focus:bg-slate-700',
      count: (operations, fadeOutOps) =>
        operations.filter(op => Number(op.StateCode) === 1 && !fadeOutOps[op.NumOperation]).length,
    },
    {
      value: 0,
      label: t('status.archived'),
      icon: Archive,
      activeColor: 'text-orange-700 dark:text-orange-300',
      activeBg: 'bg-orange-50 dark:bg-orange-900/30',
      activeIcon: 'text-orange-600 dark:text-orange-400',
      inactiveIcon: 'text-gray-300 dark:text-slate-600',
      hover: 'hover:bg-orange-50 dark:hover:bg-slate-800',
      focus: 'focus:bg-orange-100 dark:focus:bg-slate-700',
      count: (operations) =>
        operations.filter(op => Number(op.StateCode) === 0).length,
    },
    {
      value: 2,
      label: t('status.preparation'),
      icon: Clock,
      activeColor: 'text-violet-700 dark:text-violet-300',
      activeBg: 'bg-violet-50 dark:bg-violet-900/30',
      activeIcon: 'text-violet-500 dark:text-violet-400',
      inactiveIcon: 'text-gray-300 dark:text-slate-600',
      hover: 'hover:bg-violet-50 dark:hover:bg-slate-800',
      focus: 'focus:bg-violet-100 dark:focus:bg-slate-700',
      count: (operations) =>
        operations.filter(op => Number(op.StateCode) === 2).length,
    },
    {
      value: 3,
      label: t('status.open'),
      icon: CheckCircle,
      activeColor: 'text-sky-700 dark:text-sky-300',
      activeBg: 'bg-sky-50 dark:bg-sky-900/30',
      activeIcon: 'text-sky-600 dark:text-sky-400',
      inactiveIcon: 'text-gray-300 dark:text-slate-600',
      hover: 'hover:bg-sky-50 dark:hover:bg-slate-800',
      focus: 'focus:bg-sky-100 dark:focus:bg-slate-700',
      count: (operations) =>
        operations.filter(op => Number(op.StateCode) === 3).length,
    },
    {
      value: 4,
      label: t('status.gestion budgetaire'),
      icon: Wallet,
      activeColor: 'text-emerald-700 dark:text-emerald-300',
      activeBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      activeIcon: 'text-emerald-600 dark:text-emerald-400',
      inactiveIcon: 'text-gray-300 dark:text-slate-600',
      hover: 'hover:bg-emerald-50 dark:hover:bg-slate-800',
      focus: 'focus:bg-emerald-100 dark:focus:bg-slate-700',
      count: (operations) =>
        operations.filter(op => Number(op.StateCode) === 4).length,
    }
  ];

  const filterLabelByStatus = (status) => {
    if (status === 1) return t('status.active');
    if (status === 0) return t('status.archived');
    if (status === 2) return t('status.preparation');
    if (status === 3) return t('status.open', 'Sous ouverture');
    if (status === 4) return t('status.gestion budgetaire');
    return t('status.all');
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-slate-700 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
          <span className="font-medium tracking-tight">
            {filterLabelByStatus(filterStatus)}
          </span>
        </button>

        {showFilterDropdown && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-[9999] overflow-y-auto max-h-96">
            {statusFilterList.map((option) => {
              const isActive = filterStatus === option.value;
              const Icon = option.icon;
              let entryCount = 0;
              entryCount = option.count(operations, fadeOutOps);
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterStatus(option.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full cursor-pointer text-left px-3 py-2 flex items-center gap-2 transition ${option.hover} ${option.focus} ${isActive ? option.activeBg + ' ' + option.activeColor : 'text-gray-700 dark:text-slate-300'}`}
                  style={{ fontSize: '0.83rem' }}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? option.activeIcon : option.inactiveIcon}`}
                  />
                  <span className="font-medium">{option.label}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-slate-500">
                    ({entryCount})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropDownFilter;