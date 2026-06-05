import React, { useState, useEffect, useRef } from 'react';
import { Plus, Archive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getOperations,
  newOperation,
  updateOperation,
  deleteOperationService,
  manageArchiveOperation,
  validateOperationService
} from '../../services/Operations/operationService';
import { OperationsTable } from './OperationsTable';
import { FormModal } from '../Shared/FormModal';
import { NewOperationForm } from './NewOperationForm';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';
import { ConfirmValidateModal } from '../Shared/tools/ValidateConfirmation';
import {
  getBudgetTypeLabel,
  getModeAttribuationLabel,
  getTypeTravauxLabel,
  getStateLabel,
  formatDate
} from '../../utils/typeHandler';
import { SearchBar } from '../Shared/tools/SearchBar';
import DropDownFilter from '../Shared/dropDownFilter';

import { useNavigate } from 'react-router-dom';

export function OperationsSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const hasFetchedRef = useRef(false);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For animating deleted (archived) rows
  const [deletingOp, setDeletingOp] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(2); // 1: Active, 0: Archived, 2: Prepare
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal States
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  // Ajout des états nécessaires pour validateOperation
  const [showValidateOperationModal, setShowValidateOperationModal] = useState(false);
  const [opId, setOpId] = useState(null);


  const [newOperationData, setNewOperationData] = useState({
    NumOperation: '',
    ServContract: '',
    Objectif: '',
    TravalieType: 'Travaux',
    BudgetType: 'Equipement',
    MethodAttribuation: "Appel d'Offres Ouvert",
    VisaNum: '',
    DateVisa: new Date().toISOString().split('T')[0],
    adminId: user?.userId || '',
    Program: '',
    AP: ''
  });
  
  const fetchOperations = async () => {
    try {
      setLoading(true);
      const adminID = user?.userId || user?.userid;
      if (!adminID) return;

      const operationsData = await getOperations(adminID);
      const mappedOperations = operationsData.map(op => ({
        id: op.Id,
        NumOperation: op.Numero || '',
        ServiceDeContract: op.Service_Contractant || '',
        TypeBudget: getBudgetTypeLabel(op.TypeBudget),
        TypeBudgetCode: op.TypeBudget,
        ModeAttribution: getModeAttribuationLabel(op.ModeAttribuation),
        ModeAttributionCode: op.ModeAttribuation,
        Objectif: op.Objet || '',
        TypeTravail: getTypeTravauxLabel(op.TypeTravaux),
        TypeTravauxCode: op.TypeTravaux,
        State: getStateLabel(op.State),
        StateCode: op.State !== undefined && op.State !== null ? Number(op.State) : 1,
        VisaNumber: op.NumeroVisa || '',
        VisaDate: formatDate(op.DateVisa),
        VisaDateOriginal: op.DateVisa
          ? new Date(op.DateVisa).toISOString().split('T')[0]
          : '',
        Program: op.Program || '',
        AP: op.AP != null && op.AP !== '' ? String(op.AP) : ''
      }));

      setOperations(mappedOperations);
    } catch (error) {
      showToast(t('operations.fetchError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current && user?.userId) {
      fetchOperations();
      hasFetchedRef.current = true;
    }
  }, [user]);


  const handleOpenModal = (operation) => {
    setShowFilterDropdown(false)
    if (operation) {
      setEditingOperation(operation);
      setNewOperationData({
        NumOperation: operation.NumOperation,
        ServContract: operation.ServiceDeContract,
        Objectif: operation.Objectif,
        TravalieType: operation.TypeTravauxCode === 1 ? 'Travaux' :
          operation.TypeTravauxCode === 2 ? 'Prestations' :
            operation.TypeTravauxCode === 3 ? 'Equipement' : 'Etude',
        BudgetType: operation.TypeBudgetCode === 1 ? 'Equipement' :
          operation.TypeBudgetCode === 2 ? 'Fonctionnement' : 'Opérations Hors Budget',
        MethodAttribuation: operation.ModeAttributionCode === 1 ? "Appel d'Offres Ouvert" : "Appel d'Offres Restreint",
        VisaNum: operation.VisaNumber,
        DateVisa: operation.VisaDateOriginal || (operation.VisaDate ? new Date(operation.VisaDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        adminID: user?.userId || '',
        Program: operation.Program || '',
        AP: operation.AP || ''
      });
    } else {
      setEditingOperation(null);
      setNewOperationData({
        NumOperation: '',
        ServContract: '',
        Objectif: '',
        TravalieType: 'Travaux',
        BudgetType: 'Equipement',
        MethodAttribuation: "Appel d'Offres Ouvert",
        VisaNum: '',
        DateVisa: new Date().toISOString().split('T')[0],
        adminId: user?.userId || '',
        Program: '',
        AP: ''
      });
    }
    setShowOperationModal(true);
  };

  const handleValidateOperation = async () => {
    setShowValidateOperationModal(false);
    setIsSubmitting(true);
    try {
      const result = await validateOperationService(opId);
      if (result?.success) {
        showToast(t('operations.validatedSuccess'), 'success');
        await fetchOperations();
      } else {
        showToast(result?.message || t('operations.validationError'), 'error');
      }
    } catch (err) {
      showToast(t('operations.connectionError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveOperation = async () => {
    if (!newOperationData.NumOperation || !newOperationData.Objectif) {
      showToast(t('operations.fillRequiredFields'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      let result;
      if (editingOperation) {
        const formData = {
          Id: editingOperation.id,
          NumOperation: newOperationData.NumOperation,
          ServContract: newOperationData.ServContract,
          Objectif: newOperationData.Objectif,
          TravalieType: newOperationData.TravalieType,
          BudgetType: newOperationData.BudgetType,
          MethodAttribuation: newOperationData.MethodAttribuation,
          VisaNum: newOperationData.VisaNum,
          DateVisa: newOperationData.DateVisa,
          Program: newOperationData.Program,
          AP: newOperationData.AP,
          adminID: user?.userId || user?.userid
        };
        result = await updateOperation(formData);
      } else {
        result = await newOperation({ ...newOperationData, adminID: user?.userId });
      }

      if (result?.success || result?.code === 0) {
        showToast(editingOperation ? t('operations.updatedSuccess', 'Opération modifiée avec succès.') : t('operations.addedSuccess'), 'success');
        await fetchOperations();
        setNewOperationData({
          NumOperation: '',
          ServContract: '',
          Objectif: '',
          TravalieType: 'Travaux',
          BudgetType: 'Equipement',
          MethodAttribuation: "Appel d'Offres Ouvert",
          VisaNum: '',
          DateVisa: new Date().toISOString().split('T')[0],
          adminId: user?.userId || '',
          Program: '',
          AP: ''
        });
        setShowOperationModal(false);
        setEditingOperation(null);
      } else {
        showToast(result.error || result.message || t('operations.addError'), 'error');
      }
    } catch (error) {
      showToast(t('operations.connectionError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [fadeOutOps, setFadeOutOps] = useState({});

  const handleDeleteOperation = async (operationID) => {
    setDeletingOp(operationID);

    try {
      const result = await deleteOperationService(operationID);
      if (result.success) {
        // Store current filter status to use in setTimeout
        const currentFilter = Number(filterStatus);

        // Update the operation's state in the local state
        setOperations(prev =>
          prev.map(op => {
            if (op.id === operationID) {
              return {
                ...op,
                StateCode: 0,
                State: getStateLabel(0)
              };
            }
            return op;
          })
        );

        // Start the fade-out animation
        setFadeOutOps(prev => ({ ...prev, [operationID]: true }));

        // Wait for fade-out animation to complete
        setTimeout(() => {
          // Remove the fade-out effect
          setFadeOutOps(prev => {
            const p = { ...prev };
            delete p[operationID];
            return p;
          });
          setDeletingOp(null);

          // Show success toast
          showToast(result.message || t('operations.archiveSuccess'), 'success');

          // Force a re-render by triggering refresh
          setRefreshTrigger(prev => prev + 1);
        }, 400);

      } else {
        setDeletingOp(null);
        console.error('Delete handler error:', result);

        if (result.code === 1000) {
          showToast(t('operations.archiveBlocked'), 'error');
        } else {
          showToast(result.message || t("operations.archiveError", "Erreur lors de l'archivage."), 'error');
        }
      }
    } catch (error) {
      setDeletingOp(null);
      console.error('Unexpected delete handler error:', error);
      showToast(t("operations.connectionError", 'Erreur de connexion au serveur.'), 'error');
    }
  };

  const handleUnarchiveOperation = async (operationId) => {
    try {
      // Store current filter status
      const currentFilter = Number(filterStatus);

      // Optimistically update the UI first
      setOperations(prevOperations =>
        prevOperations.map(op =>
          op.id === operationId
            ? { ...op, StateCode: 1, State: getStateLabel(1) }
            : op
        )
      );

      const result = await manageArchiveOperation(operationId);

      if (result && result.success) {
        showToast(`${result.message}`, 'success');
      } else {
        // Revert on error
        setOperations(prevOperations =>
          prevOperations.map(op =>
            op.id === operationId
              ? { ...op, StateCode: 0, State: getStateLabel(0) }
              : op
          )
        );
        showToast(result?.message || t('operations.unarchiveError'), 'error');
      }

      // Force refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      // Revert on error
      setOperations(prevOperations =>
        prevOperations.map(op =>
          op.id === operationId
            ? { ...op, StateCode: 0, State: getStateLabel(0) }
            : op
        )
      );
      showToast(t("operations.unarchiveErrorBoundary", 'Erreur lors du désarchivage de l’opération.'), 'error');
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Filter operations based on search term and status
  const filteredOperationsForTable = operations.filter(op => {
    // If fading out this entry and showing active, hide it
    if (fadeOutOps[op.id] && Number(filterStatus) === 1) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      op.NumOperation?.toLowerCase().includes(term) ||
      op.Objectif?.toLowerCase().includes(term) ||
      op.ServiceDeContract?.toLowerCase().includes(term) ||
      '';

    const stateCode = Number(op.StateCode);
    const currentFilter = Number(filterStatus);

    const matchesStatus = stateCode === currentFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8">Chargement...</div>;

  const fadeOutStyle = (
    <style>
      {`
      .fade-out-row {
        opacity: 1;
        pointer-events: auto;
        transition: opacity 0.4s cubic-bezier(.4,0,.2,1);
      }
      .fade-out-row.fading {
        opacity: 0.25;
        transition: opacity 0.4s cubic-bezier(.4,0,.2,1);
        pointer-events: none;
      }
      `}
    </style>
  );

  const rowClassNameForOp = (op) => {
    if (fadeOutOps[op.id]) {
      return 'fade-out-row fading';
    }
    return 'fade-out-row';
  };

  function getEmptyStateText(filterStatus) {
    if (filterStatus === 1) {
      return {
        title: t('operations.noActive'),
        hint: t('operations.activeHint')
      };
    } else if (filterStatus === 0) {
      return {
        title: t('operations.noArchived'),
        hint: t('operations.archivedHint')
      };
    } else if (filterStatus === 2) {
      return {
        title: t('operations.noPrepare'),
        hint: t('operations.prepareHint')
      };
    } else if (filterStatus === 4) {
      return {
        title: t('status.budgetManagement'),
        hint: t('budget.noOperationsFound')
      };
    }
    return {
      title: t('operations.noOperation'),
      hint: ''
    };
  }

  const emptyStateText = getEmptyStateText(Number(filterStatus));

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen w-full">
      <h1 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-slate-200 mb-4">{t('operations.listTitle')}</h1>
      {fadeOutStyle}
      <div className="w-full space-y-8">
        {/* Remove overflow-hidden from this section */}
        <section className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded shadow-sm transition-colors w-full">
          <div className="border-b border-gray-300 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <SearchBar
                  placeholder={t("operations.searchPlaceholder")}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <DropDownFilter
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    showFilterDropdown={showFilterDropdown}
                    setShowFilterDropdown={setShowFilterDropdown}
                    operations={operations}
                    fadeOutOps={fadeOutOps}
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => handleOpenModal(null)}
                    className="px-3 py-1 bg-slate-700 dark:bg-slate-600 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-500 flex items-center gap-2 text-sm disabled:bg-slate-400 dark:disabled:bg-slate-700 cursor-pointer transition-colors shadow-sm"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4" /> {t('operations.addOperation')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-white dark:bg-slate-900 overflow-x-auto">
            {filteredOperationsForTable.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                <Archive className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="text-lg font-medium mb-2 dark:text-slate-200">
                  {emptyStateText.title}
                </p>
                <p className="text-sm dark:text-slate-400">
                  {emptyStateText.hint}
                </p>
              </div>
            ) : (
              <OperationsTable
                key={refreshTrigger}
                operations={filteredOperationsForTable}
                handleDeleteOperation={handleDeleteOperation}
                handleOpenDetailsModal={op => {
                  navigate(`/op/${op.id}`, { state: { operation: op } });
                }}
                filterStatus={filterStatus}
                handleUnarchiveOperation={handleUnarchiveOperation}
                handleValidateOperation={(id) => {
                  setOpId(id);
                  setShowValidateOperationModal(true);
                }}
                rowClassName={rowClassNameForOp}
              />
            )}
          </div>
        </section>
      </div>
      <FormModal
        isOpen={showOperationModal}
        onClose={() => {
          setShowOperationModal(false);
          setEditingOperation(null);
        }}
        onSave={handleSaveOperation}
        title={editingOperation ? t('operations.editOperation', 'Modifier l\'opération') : t('operations.newOperation')}
        saveText={editingOperation ? t('edit', 'Modifier') : t('operations.addOperation')}
        isLoading={isSubmitting}
      >
        <NewOperationForm
          newOperationData={newOperationData}
          setNewOperationData={setNewOperationData}
          isEditing={editingOperation}
        />
      </FormModal>
      {showValidateOperationModal && (
        <ConfirmValidateModal
          isOpen={showValidateOperationModal}
          onClose={() => setShowValidateOperationModal(false)}
          onConfirm={handleValidateOperation}
          isLoading={isSubmitting}
          title={t('operations.validateOperation')}
          confirmText={t('validate')}
          message={t('operations.confirmValidate')}
        />
      )}
    </div>
  );
}