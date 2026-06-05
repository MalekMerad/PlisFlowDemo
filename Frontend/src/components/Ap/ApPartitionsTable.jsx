// components/ApPartitions/ApPartitionsTable.jsx
import { SquarePen, Trash2, ChartBar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from "../Shared/tools/Pagination";
import { useState } from "react";
import { ConfirmDeleteModal } from "../Shared/tools/DeleteConfirmation";
import { useTranslation } from "react-i18next";
import { getTravauxTypeLabel } from '../../services/ApServices/ApServices';

export function ApPartitionsTable({ Partitions, handleOpenModal, handleDeletePartition, readOnly, operationAP, IsOperationActive }) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentPartitions = Partitions.slice(indexOfFirstRow, indexOfLastRow);

    const totalPages = Math.ceil(Partitions.length / rowsPerPage);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPartition, setSelectedPartition] = useState(null);
    const currentLocale = i18n.language === 'ar' ? 'ar-DZ' : (i18n.language === 'en' ? 'en-US' : 'fr-FR');

    const openDeleteModal = (partition) => {
        setSelectedPartition(partition);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (selectedPartition) {
            handleDeletePartition(selectedPartition.Id);
            setSelectedPartition(null);
            setShowDeleteModal(false);
        }
    };

    const formatCurrency = (amount, locale) => {
        const formattedNumber = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

        if (i18n.language === 'ar') {
            return formattedNumber.replace('DZD', 'دج');
        }

        return formattedNumber;
    };


    return (
        <div className="space-y-3">
            <div className="overflow-x-auto">
                <div className="space-y-0 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    {currentPartitions.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-400 dark:text-slate-500 text-xs italic bg-white dark:bg-slate-900">
                            {t("apPartition.noPartitionsFound", "Aucune partition AP trouvée pour cette opération")}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 transition-colors">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 px-3 py-1.5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="col-span-3">{t('apPartition.type', 'Type')}</div>
                                <div className="col-span-5">{t('apPartition.description', 'Description')}</div>
                                <div className="col-span-3 text-right">{t('apPartition.budget', 'Budget')}</div>
                                <div className="col-span-1 text-right">{t('apPartition.actions', 'Actions')}</div>
                            </div>
                            {/* Table Rows */}
                            <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                                {currentPartitions.map((partition) => (
                                    <li
                                        key={partition.Id}
                                        className="grid grid-cols-12 gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                                    >
                                        <div className="col-span-3">
                                            <span className="text-slate-700 dark:text-slate-300 text-[12px] font-semibold">
                                                {getTravauxTypeLabel(partition.TravauxType)}
                                            </span>
                                        </div>
                                        <div className="col-span-5">
                                            <p className="text-slate-600 dark:text-slate-400 text-[12px] font-medium break-words">
                                                {partition.Description || '-'}
                                            </p>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <span className="text-slate-700 dark:text-slate-300 text-[12px] font-semibold">
                                                {formatCurrency(partition.Budget || 0, currentLocale)}
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end gap-1.5">
                                           {IsOperationActive ? (
                                               <button
                                                   onClick={() => navigate(`/partition/${partition.Id}/details?operationId=${partition.OperationId}`)}
                                                   className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer"
                                                   title={t('common.details', 'Détails')}
                                               >
                                                   <ChartBar size={14} className="rotate-270" />
                                               </button>
                                           ) : null}
                                      
                                            {!readOnly && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenModal(partition)}
                                                        className="p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all cursor-pointer"
                                                        title={t('common.modify', 'Modifier')}
                                                    >
                                                        <SquarePen size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(partition)}
                                                        className="p-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all cursor-pointer"
                                                        title={t('common.delete', 'Supprimer')}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {Partitions.length > rowsPerPage && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    handlePageChange={setCurrentPage}
                />
            )}

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title={t("apPartition.deleteTitle", "Supprimer partition AP")}
                message={
                    selectedPartition
                        ? t('apPartition.deleteMsgWithType', `Êtes-vous sûr de vouloir supprimer la partition AP de type "{{type}}" avec un budget de {{budget}} ?`, {
                            type: getTravauxTypeLabel(selectedPartition.TravauxType),
                            budget: formatCurrency(selectedPartition.Budget, currentLocale)
                        })
                        : t('apPartition.deleteMsg', 'Êtes-vous sûr de vouloir supprimer cette partition AP ?')
                }
            />
        </div>
    );
}