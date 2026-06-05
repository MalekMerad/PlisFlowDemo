import { SquarePen, Trash2 } from 'lucide-react';
import { Pagination } from "../Shared/tools/Pagination"
import { useState } from "react";
import { ConfirmDeleteModal } from "../Shared/tools/DeleteConfirmation";
// Traduction
import { useTranslation } from "react-i18next";

export function LotsTable({ Lots, handleOpenModal, handleDeleteLot, readOnly }) {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentLots = Lots.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(Lots.length / rowsPerPage);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  const openDeleteModal = (lot) => {
    setSelectedLot(lot);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedLot) {
      handleDeleteLot(selectedLot.Id || selectedLot.id);
      setSelectedLot(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="space-y-0 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
          {currentLots.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 dark:text-slate-500 text-sm italic bg-white dark:bg-slate-900">
              {t("lot.noLotsFound", "Aucun lot trouvé pour cette opération")}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {currentLots.map((lot) => (
                <li
                  key={lot.Id || lot.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm font-medium min-w-0">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] shrink-0 mt-0.5 transition-colors">
                          {lot.NumeroLot}
                        </span>
                        <span className="break-words leading-relaxed">
                          {lot.Designation}
                        </span>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenModal(lot)}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all cursor-pointer"
                          title={t('common.modify', 'Modifier')}
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(lot)}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all cursor-pointer"
                          title={t('common.delete', 'Supprimer')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={t("common.deleteLotTitle", "Supprimer lot")}
        message={
          selectedLot
            ? t('common.deleteLotMsgWithNum', `Êtes-vous sûr de vouloir supprimer le lot "{{NumeroLot}}" ?`, { NumeroLot: selectedLot.NumeroLot })
            : t('common.deleteLotMsg', 'Êtes-vous sûr de vouloir supprimer ce lot ?')
        }
      />
    </div>
  );
}