import { useState, useEffect } from "react";
import { Trash2, UserPlus, CheckCircle2, Archive, ArchiveRestore } from "lucide-react";
import { Pagination } from "../Shared/tools/Pagination";
import { ConfirmDeleteModal } from "../Shared/tools/DeleteConfirmation";
import { useTranslation } from "react-i18next";

export function OperationsTable({
  operations,
  handleDeleteOperation,
  handleOpenDetailsModal,
  filterStatus = 1,
  handleUnarchiveOperation,
  handleValidateOperation,
  rowClassName
}) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Reset to first page when operations change
  useEffect(() => {
    setCurrentPage(1);
  }, [operations.length]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentOperations = operations.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(operations.length / rowsPerPage);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOperationID, setSelectedOperationID] = useState(null);

  const openDeleteModal = (operationID) => {
    setSelectedOperationID(operationID);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedOperationID !== null) {
      handleDeleteOperation(selectedOperationID);
      setSelectedOperationID(null);
      setShowDeleteModal(false);
    }
  };

  const isActiveView = Number(filterStatus) === 1;
  const isArchivedView = Number(filterStatus) === 0;
  const isSousOpenView = Number(filterStatus) === 3;

  // Set appropriate modal text based on filterStatus
  const deleteModalTitle = isActiveView || isSousOpenView
    ? t('operations.archiveOperation')
    : t('operations.restoreOperation');
  const deleteModalMessage = isActiveView || isSousOpenView
    ? t('operations.archiveConfirmMessage')
    : t('operations.restoreConfirmMessage');

  const isRTL = i18n.language === "ar";

  return (
    <div className={`space-y-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="overflow-x-auto rounded-lg border border-transparent dark:border-slate-800 transition-colors">
        <table className="w-full border-collapse">
          <tbody className="bg-white dark:bg-slate-900">
            {currentOperations.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 text-sm"
                >
                  {isActiveView ? t('operations.noActiveOperations') :
                    isArchivedView ? t('operations.noArchivedOperations') :
                      isSousOpenView ? t('operations.noSousOpenOperations') :
                        t('operations.noPrepareOperations')}
                </td>
              </tr>
            ) : (
              currentOperations.map((op) => (
                <tr
                  key={op.id}
                  className={`hover:bg-gray-100 dark:hover:bg-slate-950 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0 ${rowClassName ? rowClassName(op) : ''}`}
                >
                  <td className="px-4 py-2 text-sm" colSpan={2}>
                    <div
                      className="cursor-pointer"
                      onClick={() => handleOpenDetailsModal(op)}
                      title={t('operations.viewDetails')}
                      style={{ userSelect: 'none' }}
                    >
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        {t('operations.operation')} N° {op.NumOperation} :
                      </div>

                      <span className="text-gray-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                        {op.Objectif}
                      </span>
                      {op.ServiceDeContract && (
                        <>
                          <span className="mx-1" />
                          <span className="text-gray-400 dark:text-slate-500 text-xs mt-1">
                            ({op.ServiceDeContract})
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center align-top">
                    <div className="flex justify-end items-start gap-3 mt-2">
                      {Number(op.StateCode) === 2 ? (
                        <button
                          onClick={() => handleValidateOperation(op.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-md text-blue-600 hover:text-blue-800 font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-40 cursor-pointer"
                          type="button"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs">{t('operations.validate')}</span>
                        </button>
                      ) : (isActiveView || isSousOpenView) ? (
                        <button
                          onClick={() => openDeleteModal(op.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-md text-red-600 hover:text-red-800 font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-40 cursor-pointer"
                          title={t('operations.archiveOperation')}
                          type="button"
                        >
                          <Archive className="w-4 h-4" />
                          <span className="text-xs">{t('operations.archive')}</span>
                        </button>
                      ) : isArchivedView ? (
                        <button
                          onClick={() => handleUnarchiveOperation(op.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-md text-green-600 hover:text-green-800 font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-40 cursor-pointer"
                          title={t('operations.restoreOperation')}
                          type="button"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                          <span className="text-xs">{t('operations.restore')}</span>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {operations.length > rowsPerPage && (
        <Pagination
          itemsPerPage={rowsPerPage}
          totalPages={totalPages}
          totalItems={operations.length}
          handlePageChange={setCurrentPage}
          currentPage={currentPage}
        />
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={deleteModalTitle}
        message={deleteModalMessage}
        ButtonContext={(isActiveView || isSousOpenView) ? t('operations.archive') : t('operations.restore')}
      />
    </div>
  );
}