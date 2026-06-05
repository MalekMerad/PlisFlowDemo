import React, { useState, useMemo } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../Shared/tools/Pagination';
import { useTranslation } from 'react-i18next';
import { deleteOperationFromSessionService } from '../../services/Evaluation/evaluationServices';
import { ConfirmDeleteModal } from '../Shared/tools/DeleteConfirmation'
import { toast } from 'react-toastify';

const OperationEvaluationTable = ({
  operations = [],
  sessionId = null,
  sessionTime = null,
  disableBtn = true,
  isClosed = false,
  showDeleteButton = true,
  onDeleteSuccess = () => { }
}) => {
  const { t, i18n } = useTranslation();
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalOperations = operations.length;
  const totalPages = Math.ceil(totalOperations / PAGE_SIZE);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [opToDelete, setOpToDelete] = useState(null);

  const navigate = useNavigate();

  // Slice data for pagination
  const pagedOperations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return operations.slice(start, start + PAGE_SIZE);
  }, [operations, currentPage]);

  // If operations array shrinks, reset current page if out of range
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages));
  }, [operations, totalPages, currentPage]);

  const handleEvaluateClick = (operationId) => {
    if (disableBtn) return;
    navigate(`/opEval/${operationId}`, {
      state: { sessionId, sessionTime }
    });
  };

  const handleDeleteOperation = (operationId) => {
    setOpToDelete(operationId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionId || !opToDelete) return;

    try {
      const response = await deleteOperationFromSessionService(sessionId, opToDelete);
      if (response.success) {
        toast.success(t('common.toasts.deleted'));
        onDeleteSuccess();
      } else {
        toast.error(response.message || t('common.toasts.error'));
      }
    } catch (error) {
      console.error("Error deleting operation from session:", error);
      toast.error(t('common.toasts.serverError'));
    } finally {
      setIsDeleteModalOpen(false);
      setOpToDelete(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded shadow-sm overflow-hidden transition-colors">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-2 py-1 text-center text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                {t('operationEvaluationTable.operation')}
              </th>
              <th className="px-2 py-1 text-center text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                {t('operationEvaluationTable.lots')}
              </th>
              <th className="px-2 py-1 text-center text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                {t('operationEvaluationTable.action')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {pagedOperations.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-center text-gray-500 dark:text-slate-400 text-[11px]" colSpan={4} style={{ textAlign: "center" }}>
                  {t('operationEvaluationTable.noOperationFound')}
                </td>
              </tr>
            ) : (
              pagedOperations.map((operation, idx) => {
                // Handle both possible property name conventions
                const operationId = operation.OperationID || operation.id;
                const operationNumber = operation.Numero || operation.reference || 'N/A';

                // Get lots count from LotsCount property or calculate from Lots array
                const lotCount = operation.LotsCount || operation.lotsCount ||
                  (operation.Lots ? operation.Lots.length :
                    (operation.lots ? operation.lots.length : 0));

                return (
                  <tr key={operationId || idx} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition" style={{ textAlign: "center" }}>
                    <td className="px-2 py-2" style={{ textAlign: "center" }}>
                      <span className="text-[11px] font-bold text-gray-950 dark:text-slate-100">
                        {operationNumber}
                      </span>
                    </td>
                    <td className="px-2 py-2" style={{ textAlign: "center" }}>
                      {lotCount > 0 ? (
                        <span className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          {lotCount} lot{lotCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 dark:text-slate-500 italic">
                          {t('operationEvaluationTable.noLot')}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2" style={{ textAlign: "center" }}>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleEvaluateClick(operationId)}
                          disabled={disableBtn}
                          title={t('operationEvaluationTable.evaluate')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-tight transition shadow-sm ${disableBtn
                            ? 'bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-slate-600 cursor-not-allowed border border-gray-400 dark:border-slate-700'
                            : 'bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500 cursor-pointer border border-slate-800 dark:border-slate-500'
                            }`}
                          tabIndex={disableBtn ? -1 : 0}
                        >
                          {t('operationEvaluationTable.evaluate')}
                          <ChevronRight className="w-3 h-3" rtl="true" style={{ transform: i18n.language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                        </button>

                        {showDeleteButton && (
                          <button
                            onClick={() => handleDeleteOperation(operationId)}
                            title={t('operationEvaluationTable.delete')}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count and pagination */}
      {operations.length > 0 && (
        <div className="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/80 px-4 py-2 flex items-center justify-between flex-wrap gap-2 transition-colors">
          <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={setCurrentPage} />
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('common.confirmationTitle')}
        message={t('operationEvaluationTable.confirmDelete')}
        ButtonContext={t('common.delete')}
      />
    </div>
  );
};

export default OperationEvaluationTable;