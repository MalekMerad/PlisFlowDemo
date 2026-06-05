import { Download, Plus, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function BudgetDataTable({
  title,
  titleIcon: TitleIcon,
  columns,
  rows,
  onAddClick,
  onStatusClick,
  onDownloadClick,
  onRowDownloadClick,
  onRowClick,
  selectedRowId
}) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all'); // 'all', 'credit', 'debit'

  const renderStatusBadge = (status, row, columnKey) => {
    const statusConfig = {
      Pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        dot: 'bg-yellow-500',
        label: t('budget.statusLabels.pending') || 'Pending'
      },
      Validated: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500',
        label: t('budget.statusLabels.validated') || 'Validated'
      },
      Completed: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        dot: 'bg-blue-500',
        label: t('budget.statusLabels.completed') || 'Completed'
      },
      DEBIT: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        dot: 'bg-red-500',
        label: 'Debit'
      },
      CREDIT: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-300',
        dot: 'bg-emerald-500',
        label: 'Credit'
      }
    };

    const config = statusConfig[status] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-400',
      label: status
    };

    const isClickable = onStatusClick && columnKey === 'status' && status === 'Pending';

    return (
      <span
        onClick={(event) => {
          event.stopPropagation();
          if (isClickable) onStatusClick(row, columnKey);
        }}
        className={`inline-flex items-center justify-center gap-1 font-medium transition-all px-1.5 py-0.5 text-[10px] rounded-md ${config.bg} ${config.text} ${isClickable ? 'cursor-pointer hover:ring-1 hover:ring-current' : ''
          }`}
      >
        <span className={`w-1 h-1 rounded-full ${config.dot}`}></span>
        {config.label}
      </span>
    );
  };

  const renderCellContent = (column, value, row) => {
    // Handle amount fields - standardize size
    if (column.key === 'amount') {
      if (!value && value !== 0) return <span className="text-[10px]">—</span>;
      if (typeof value === 'number') return <span className="text-[10px] font-medium">{value.toLocaleString()} DZD</span>;
      if (typeof value === 'string' && !isNaN(parseFloat(value))) return <span className="text-[10px] font-medium">{parseFloat(value).toLocaleString()} DZD</span>;
      return <span className="text-[10px]">{value || '—'}</span>;
    }

    // Handle date fields - standardize size
    if (column.key === 'date' || column.key === 'dateEngagement' || column.key === 'datePayment') {
      if (!value || value === '—') return <span className="text-[10px]">—</span>;
      return <span className="text-[10px]">{value}</span>;
    }

    // Handle status fields - keep badge but ensure consistent sizing
    if (column.key === 'status') {
      return renderStatusBadge(value, row, column.key);
    }

    // Handle type fields (DEBIT/CREDIT)
    if (column.key === 'type' || column.key === 'relatedEngagementType') {
      return renderStatusBadge(value, row, column.key);
    }

    // Handle reference fields - remove mono font to match size
    if (column.key === 'reference' ||
      column.key === 'cfVisaNumber' ||
      column.key === 'relatedEngagementReference' ||
      column.key === 'paymentOrderNumber' ||
      column.key === 'treasuryReference') {
      if (!value || value === '—') return <span className="text-[10px]">—</span>;
      return <span className="text-[10px]">{value}</span>;
    }

    // Handle travaux type / works type - standardize with others
    if (column.key === 'travauxType' || column.key === 'worksType') {
      return <span className="text-[10px]">{value || '—'}</span>;
    }

    // Default text rendering - consistent size for all
    if (!value || value === '') return <span className="text-[10px]">—</span>;
    return <span className="text-[10px]">{value}</span>;
  };

  // Filter rows based on selected type
  const getFilteredRows = () => {
    if (filterType === 'all') return rows;

    return rows.filter(row => {
      const typeValue = row.type || row.relatedEngagementType;
      if (filterType === 'credit') return typeValue === 'CREDIT';
      if (filterType === 'debit') return typeValue === 'DEBIT';
      return true;
    });
  };

  const filteredRows = getFilteredRows();

  // Check if type column exists in the columns
  const hasTypeColumn = columns.some(col => col.key === 'type' || col.key === 'relatedEngagementType');

  return (
    <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/30 flex justify-between items-center flex-shrink-0">
        <h3 className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          {TitleIcon && <TitleIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />}
          {title}
          {filterType !== 'all' && (
            <span className="ml-2 text-[9px] font-normal text-slate-500 dark:text-slate-400">
              ({filteredRows.length} {t('budget.filtered') || 'filtered'})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1.5">
          {/* Type Filter Dropdown */}
          {hasTypeColumn && (
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-[10px] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">{t('budget.filterAll') || 'All Types'}</option>
                <option value="credit">{t('budget.filterCredit') || 'Credit Only'}</option>
                <option value="debit">{t('budget.filterDebit') || 'Debit Only'}</option>
              </select>
            </div>
          )}
          {(onAddClick || onDownloadClick) && (
            <>
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="inline-flex items-center justify-center p-1 rounded-md bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
              {onDownloadClick && (
                <button
                  onClick={onDownloadClick}
                  className="inline-flex items-center justify-center p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors"
                  title={t('budget.downloadAll') || 'Download All'}
                >
                  <Download className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Table container - takes remaining space */}
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full h-full table-fixed">
          <thead className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-700 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-1.5 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                  style={{ width: `${100 / (columns.length + (onRowDownloadClick ? 1 : 0))}%` }}
                >
                  {column.label}
                </th>
              ))}
              {onRowDownloadClick && (
                <th
                  className="px-3 py-1.5 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                  style={{ width: `${100 / (columns.length + 1)}%` }}
                >
                  {t('budget.download') || 'Download'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onRowDownloadClick ? 1 : 0)}
                  className="px-3 py-6 text-center text-[11px] text-slate-500 dark:text-slate-400"
                >
                  {filterType !== 'all'
                    ? (t('budget.noDataForFilter') || `No ${filterType} data available`)
                    : (t('budget.noData') || 'No data available')}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''
                    } ${selectedRowId === row.id ? 'bg-blue-50 dark:bg-slate-800/70' : ''
                    }`}
                >
                  {columns.map((column) => {
                    const cellValue = row[column.key];
                    return (
                      <td
                        key={`${column.key}-${index}`}
                        className="px-3 py-1.5 text-left text-[11px] text-slate-700 dark:text-slate-200 align-middle truncate"
                      >
                        {renderCellContent(column, cellValue, row)}
                      </td>
                    );
                  })}
                  {onRowDownloadClick && (
                    <td className="px-3 py-1.5 text-left align-middle">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          console.log('Download button clicked for row:', row);
                          if (row && row.id) {
                            onRowDownloadClick(row);
                          } else {
                            console.error('Invalid row:', row);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 text-[9px] font-semibold transition-colors"
                      >
                        <Download className="w-2.5 h-2.5" />
                        {t('budget.download') || 'Download'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}