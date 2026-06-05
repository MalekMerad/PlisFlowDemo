// components/ApPartitions/ApPartitionsSubSection.jsx
import { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import {
    getPartitonsByOperationIdService,
    createApPartitionService,
    updateApPartitionService,
    deleteApPartitonService,
    getTravauxTypeLabel,
} from '../../services/ApServices/ApServices';
import { ApPartitionsTable } from './ApPartitionsTable';
import { useToast } from '../../hooks/useToast';
import { SectionsModal } from '../Shared/SectionsModal';
import ApPartitionForm from './ApPartitionForm';
import { useTranslation } from 'react-i18next';

export function ApPartitionsSubSection({ operationID, operationAP, refreshData, showButton, readOnly = false, IsOperationActive }) {
    const { showToast } = useToast();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartition, setEditingPartition] = useState(null);
    const [partitions, setPartitions] = useState([]);
    const [totalBudget, setTotalBudget] = useState(0);
    const [remainingBudget, setRemainingBudget] = useState(0);
    const currentLocale = i18n.language === 'ar' ? 'ar-DZ' : (i18n.language === 'en' ? 'en-US' : 'fr-FR');

    const [newPartition, setNewPartition] = useState({
        travauxType: '',
        description: '',
        budget: 0,
        operationId: operationID,
    });

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
    // Fetch partitions
    const fetchPartitions = async () => {
        if (!operationID) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await getPartitonsByOperationIdService(operationID);
            if (result.success && result.data) {
                setPartitions(result.data);
                // Calculate total budget
                const total = result.data.reduce((sum, partition) => sum + (partition.Budget || 0), 0);
                setTotalBudget(total);
                const remaining = (operationAP || 0) - total;
                setRemainingBudget(remaining > 0 ? remaining : 0);
            } else {
                setPartitions([]);
                setTotalBudget(0);
                setRemainingBudget(operationAP || 0);
            }
        } catch (error) {
            console.error('Error fetching partitions:', error);
            showToast(t('apPartition.fetchError', 'Erreur lors du chargement des partitions AP'), 'error');
            setPartitions([]);
            setTotalBudget(0);
            setRemainingBudget(operationAP || 0);
        } finally {
            setLoading(false);
        }
    };

    // Reset form when operationID changes
    useEffect(() => {
        setNewPartition(prev => ({
            ...prev,
            operationId: operationID,
        }));
    }, [operationID]);

    // Fetch partitions on mount and when operationID changes
    useEffect(() => {
        fetchPartitions();
    }, [operationID, operationAP]);

    const handleOpenModal = (partition = null) => {
        if (partition) {
            // Editing an existing partition
            setEditingPartition(partition);
            setNewPartition({
                travauxType: partition.TravauxType,
                description: partition.Description || '',
                budget: partition.Budget || 0,
                operationId: operationID,
            });
        } else {
            // Adding a new partition
            setEditingPartition(null);
            setNewPartition({
                travauxType: '',
                description: '',
                budget: 0,
                operationId: operationID,
            });
        }
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setTimeout(() => {
            setEditingPartition(null);
            setNewPartition({
                travauxType: '',
                description: '',
                budget: 0,
                operationId: operationID,
            });
        }, 100);
    };

    // Validate budget against AP limit
    const validateBudgetLimit = (budget, isEditing = false, oldBudget = 0) => {
        const currentTotalWithoutNew = totalBudget - (isEditing ? oldBudget : 0);
        const newTotal = currentTotalWithoutNew + budget;

        if (newTotal > operationAP) {
            const remaining = operationAP - currentTotalWithoutNew;
            return {
                valid: false,
                message: `Le budget total ne peut pas dépasser ${formatCurrency(operationAP, currentLocale)}. Budget restant disponible: ${formatCurrency(remaining > 0 ? remaining : 0, currentLocale)}`
            };
        }
        return { valid: true, message: '' };
    };

    const handleEditPartition = async () => {
        // Validate budget for edit
        const budgetValidation = validateBudgetLimit(
            newPartition.budget,
            true,
            editingPartition.Budget
        );

        if (!budgetValidation.valid) {
            showToast(budgetValidation.message, 'error');
            return;
        }

        try {
            const result = await updateApPartitionService(
                editingPartition.Id,
                newPartition.description,
                newPartition.budget
            );

            if (result.success) {
                handleModalClose();
                showToast(t('apPartition.editSuccess', 'Partition AP modifiée avec succès.'), 'success');
                await fetchPartitions();
                if (refreshData) refreshData();
            } else {
                showToast(result.message || t('apPartition.editError', 'Impossible de modifier la partition AP.'), 'error');
            }
        } catch (error) {
            showToast(error.message || t('apPartition.editCatchError', 'Erreur lors de la modification de la partition AP.'), 'error');
        }
    };

    const handleAddPartition = async () => {
        // Validate budget for new partition
        const budgetValidation = validateBudgetLimit(newPartition.budget, false);

        if (!budgetValidation.valid) {
            showToast(budgetValidation.message, 'error');
            return;
        }

        try {
            const partitionData = {
                operationId: operationID,
                travauxType: newPartition.travauxType,
                description: newPartition.description,
                budget: newPartition.budget
            };

            const result = await createApPartitionService(partitionData);

            if (result.success) {
                handleModalClose();
                showToast(t('apPartition.addSuccess', 'Partition AP ajoutée avec succès.'), 'success');
                await fetchPartitions();
                if (refreshData) refreshData();
            } else {
                showToast(result.message || t('apPartition.addError', "Impossible d'ajouter la partition AP."), 'error');
            }
        } catch (error) {
            showToast(error.message || t('apPartition.addCatchError', "Erreur lors de l'ajout de la partition AP."), 'error');
        }
    };

    const handleSavePartition = async () => {
        // Validation
        if (!editingPartition && !newPartition.travauxType) {
            showToast(t('apPartition.typeRequired', 'Le type de travaux est obligatoire.'), 'error');
            return;
        }

        if (newPartition.budget === undefined || newPartition.budget === null || newPartition.budget < 0) {
            showToast(t('apPartition.budgetRequired', 'Le budget doit être un nombre positif.'), 'error');
            return;
        }

        if (newPartition.budget === 0) {
            showToast(t('apPartition.budgetZero', 'Le budget doit être supérieur à 0.'), 'error');
            return;
        }

        if (editingPartition) {
            await handleEditPartition();
        } else {
            await handleAddPartition();
        }
    };

    const handleDeletePartition = async (id) => {
        try {
            const result = await deleteApPartitonService(id);

            if (result.success) {
                showToast(t('apPartition.deleteSuccess', 'Partition AP supprimée avec succès.'), 'success');
                await fetchPartitions();
                if (refreshData) refreshData();
            } else {
                showToast(result.message || t('apPartition.deleteError', 'Impossible de supprimer la partition AP.'), 'error');
            }
        } catch (error) {
            showToast(error.message || t('apPartition.deleteCatchError', 'Erreur lors de la suppression de la partition AP.'), 'error');
        }
    };

    const getBudgetStatusColor = () => {
        if (totalBudget >= operationAP) return 'text-red-600 dark:text-red-400';
        if (totalBudget >= operationAP * 0.9) return 'text-orange-600 dark:text-orange-400';
        return 'text-emerald-600 dark:text-emerald-400';
    };

    if (loading) {
        return <div className="px-6 py-4">{t('loading', 'Chargement des partitions AP ...')}</div>;
    }

    return (
        <>
            <SectionsModal
                title={t('apPartition.sectionTitle', 'Partitions AP')}
                icon={<Calculator className="w-4 h-4" />}
                buttonText={t('apPartition.addPartition', 'Ajouter Partition AP')}
                showSearch={false}
                showFilter={false}
                onButtonClick={() => handleOpenModal()}
                showButton={showButton && !readOnly}
            >
                {/* Total Budget Row */}
                <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                            <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('apPartition.apBudget', 'Budget AP Total')}
                            </div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {formatCurrency(operationAP || 0, currentLocale)}
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('apPartition.allocatedBudget', 'Budget Alloué')}
                            </div>
                            <div className={`text-sm font-bold ${getBudgetStatusColor()}`}>
                                {formatCurrency(totalBudget, currentLocale)}
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('apPartition.budgetRemaining', 'Budget Restant')}
                            </div>
                            <div className={`text-sm font-bold ${remainingBudget > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(remainingBudget, currentLocale)}
                            </div>
                        </div>
                    </div>
                    {totalBudget > operationAP && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-1.5 rounded">
                            <AlertCircle size={12} />
                            <span>{t('apPartition.budgetExceeded', 'Le budget alloué dépasse le budget AP total!')}</span>
                        </div>
                    )}
                </div>

                <ApPartitionsTable
                    IsOperationActive={IsOperationActive}
                    Partitions={partitions}
                    handleOpenModal={handleOpenModal}
                    handleDeletePartition={handleDeletePartition}
                    readOnly={readOnly}
                    operationAP={operationAP}
                />
            </SectionsModal>

            <ApPartitionForm
                showModal={showModal}
                handleModalClose={handleModalClose}
                handleSavePartition={handleSavePartition}
                editingPartition={editingPartition}
                newPartition={newPartition}
                setNewPartition={setNewPartition}
                remainingBudget={remainingBudget}
                totalBudget={totalBudget}
                operationAP={operationAP}
            />
        </>
    );
}