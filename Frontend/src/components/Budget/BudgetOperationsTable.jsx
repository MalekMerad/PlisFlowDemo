import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Hash, Building2, FileText, FolderKanban, Coins, Settings2, Archive, ClipboardList } from 'lucide-react';
import { Pagination } from '../Shared/tools/Pagination';
import { deleteOperationService } from '../../services/Operations/operationService';
import { ConfirmValidateModal } from '../Shared/tools/ValidateConfirmation';
import { toast } from 'react-toastify';

const ROWS_PER_PAGE = 15;

const formatAP = (value, lang) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  let locale = lang;
  try {
    if (!locale) {
      if (typeof window !== "undefined" && window.i18next && window.i18next.language) {
        locale = window.i18next.language;
      }
    }
  } catch { /* ignore */ }

  const isArabic = locale === 'ar' || (locale && locale.startsWith && locale.startsWith('ar'));
  const currencyLabel = isArabic ? 'دج' : 'DZD';

  let numericPart = String(value).replace(/DZD|دج/g, '').trim();
  const numericValue = Number(numericPart.replace(/[^\d.-]/g, ''));

  if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
    const localized = numericValue.toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${localized} ${currencyLabel}`;
  }

  return `${numericPart} ${currencyLabel}`;
};

export function BudgetOperationsTable({ operations, onRefresh = () => { } }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [operationToArchive, setOperationToArchive] = useState(null);

  const handleArchive = async () => {
    if (!operationToArchive) return;

    try {
      const response = await deleteOperationService(operationToArchive);
      if (response && response.success) {
        toast.success(t('operations.archiveSuccess'));
        onRefresh();
      } else {
        toast.error(response?.message || t('common.toasts.error'));
      }
    } catch (error) {
      console.error("Error archiving operation:", error);
      toast.error(t('common.toasts.serverError'));
    } finally {
      setOperationToArchive(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [operations.length]);

  const totalPages = Math.ceil(operations.length / ROWS_PER_PAGE);

  const paginatedOperations = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return operations.slice(start, start + ROWS_PER_PAGE);
  }, [currentPage, operations]);

  return (
    <div className="space-y-4">
      <ConfirmValidateModal
        isOpen={!!operationToArchive}
        onClose={() => setOperationToArchive(null)}
        onConfirm={handleArchive}
        title={t('budget.confirmArchiveTitle')}
        message={t('budget.confirmArchiveMessage')}
        ButtonContext={t('common.confirm')}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-slate-800/60">
            <tr>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center gap-1"><Hash className="w-3 h-3" />{t('budget.columns.operationNumber')}</span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center gap-1"><Building2 className="w-3 h-3" />{t('budget.columns.operationService')}</span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center gap-1"><FileText className="w-3 h-3" />{t('budget.columns.operationObject')}</span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center gap-1"><FolderKanban className="w-3 h-3" />{t('budget.columns.operationProgram')}</span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center gap-1"><Coins className="w-3 h-3" />{t('budget.columns.operationAP')}</span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center gap-1"><Settings2 className="w-3 h-3" />{t('budget.columns.action')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {paginatedOperations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-xs text-gray-500 dark:text-slate-400">
                  {t('budget.noOperationsFound')}
                </td>
              </tr>
            ) : (
              paginatedOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-950 transition-colors"
                >
                  <td className="px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200">{operation.operationNumber || '-'}</td>
                  <td className="px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200">{operation.operationService || '-'}</td>
                  <td className="px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200">{operation.operationObject || '-'}</td>
                  <td className="px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200">{operation.operationProgram || '-'}</td>
                  <td className="px-3 py-2 text-right text-xs text-slate-700 dark:text-slate-200 tabular-nums">{formatAP(operation.operationAP)}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/budget/${operation.id}`, { state: { operation } })}
                        className="p-2 rounded-lg bg-slate-700 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-sm hover:shadow-md"
                        title={t('budget.manageBudget')}
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setOperationToArchive(operation.id)}
                        className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:border-amber-300 dark:hover:border-amber-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        title={t('budget.archive')}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={setCurrentPage} />
      </div>
    </div>
  );
}