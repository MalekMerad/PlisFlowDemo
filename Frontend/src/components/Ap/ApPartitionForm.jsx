// components/ApPartitions/ApPartitionForm.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '../Shared/FormModal';
import { TravauxTypeMap, getTravauxTypesList } from '../../services/ApServices/ApServices';
import { formatDZD } from '../../utils/CurrencyFormat';

const ApPartitionForm = ({
    showModal,
    handleModalClose,
    handleSavePartition,
    editingPartition,
    newPartition,
    setNewPartition,
    remainingBudget,
    totalBudget,
    operationAP
}) => {
    const { t } = useTranslation();
    const travauxTypesList = getTravauxTypesList();

    const getMaxBudgetForType = () => {
        if (editingPartition) {
            return remainingBudget + editingPartition.Budget;
        }
        return remainingBudget;
    };

    const maxBudget = getMaxBudgetForType();

    return (
        <FormModal
            key={editingPartition ? `edit-${editingPartition.Id}` : 'add-new'}
            isOpen={showModal}
            onClose={handleModalClose}
            onSave={handleSavePartition}
            title={editingPartition ? t('apPartition.editTitle', 'Modifier la partition AP') : t('apPartition.newTitle', 'Nouvelle partition AP')}
            saveText={editingPartition ? t('edit', 'Modifier') : t('add', 'Ajouter')}
        >
            <div className="space-y-4">
                {/* Budget Info Summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{t('apPartition.apBudget', 'Budget AP Total')}:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatDZD(operationAP)}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{t('apPartition.allocatedBudget', 'Budget Alloué')}:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatDZD(totalBudget)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">{t('apPartition.remainingBudget', 'Budget Restant')}:</span>
                        <span className={`font-medium ${remainingBudget > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatDZD(remainingBudget)}
                        </span>
                    </div>
                </div>

                {!editingPartition && (
                    <div>
                        <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                            {t('apPartition.travauxType', 'Type de travaux')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={newPartition.travauxType || ''}
                            onChange={e => setNewPartition({ ...newPartition, travauxType: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="">{t('apPartition.selectType', 'Sélectionnez un type')}</option>
                            {travauxTypesList.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {editingPartition && (
                    <div>
                        <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                            {t('apPartition.travauxType', 'Type de travaux')}
                        </label>
                        <div className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs">
                            {TravauxTypeMap[editingPartition.TravauxType] || 'Unknown'}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                        {t('apPartition.budget', 'Budget')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={newPartition.budget || ''}
                        onChange={e => setNewPartition({ ...newPartition, budget: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        placeholder={t('apPartition.budgetPlaceholder', '0.00')}
                    />
                    {maxBudget > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('apPartition.maxBudget', 'Budget maximum disponible')}: {formatDZD(maxBudget)}
                        </p>
                    )}
                    {maxBudget <= 0 && !editingPartition && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            {t('apPartition.noBudgetRemaining', 'Plus de budget disponible pour de nouvelles partitions')}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                        {t('apPartition.description', 'Description')}
                    </label>
                    <textarea
                        value={newPartition.description || ''}
                        onChange={e => setNewPartition({ ...newPartition, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        placeholder={t('apPartition.descriptionPlaceholder', 'Description de la partition AP')}
                        rows={4}
                        maxLength={100}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                        {newPartition.description?.length || 0}/100
                    </div>
                </div>
            </div>
        </FormModal>
    );
};

export default ApPartitionForm;