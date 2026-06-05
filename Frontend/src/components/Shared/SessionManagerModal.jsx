import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar, FileText, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { FormModal } from './FormModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from "../../hooks/useToast";
import { getOperationsByDateService } from '../../services/Operations/operationService';
import { useTranslation } from 'react-i18next';
import SubmitLoader from './SubmitLoader';

const SessionManagerModal = ({
  isOpen = true,
  onClose,
  onCreateSession,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();

  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [availableOperations, setAvailableOperations] = useState([]);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOperations, setIsLoadingOperations] = useState(false);
  const [expandedOperations, setExpandedOperations] = useState({});
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDateTime('');
      setAvailableOperations([]);
      setSelectedOperations([]);
      setExpandedOperations({});
      setDateConfirmed(false);
      setIsSubmitting(false);
      setCreatedSessionId(null);
    }
  }, [isOpen]);

  const handleDateChange = (e) => {
    setSelectedDateTime(e.target.value);
  };

  const handleConfirmDate = async () => {
    if (!selectedDateTime) {
      showToast(t("sessionManager.selectDateError", "Veuillez sélectionner une date et une heure"), "error");
      return;
    }

    if (!user?.userId) {
      showToast(t("sessionManager.unauthenticatedUser", "Utilisateur non authentifié"), "error");
      return;
    }

    setIsLoadingOperations(true);
    try {
      // Format the datetime properly for SQL Server
      let formattedDateTime = selectedDateTime;
      if (formattedDateTime.length === 16 && formattedDateTime.includes('T')) {
        formattedDateTime = `${formattedDateTime}:00`;
      }

      // Use your existing service to fetch operations for this date
      const response = await getOperationsByDateService(user.userId, formattedDateTime);

      if (response.success && Array.isArray(response.data)) {
        setAvailableOperations(response.data);
        setDateConfirmed(true);
        showToast(
          t("sessionManager.operationsFound", {
            defaultValue: "{{count}} opération(s) trouvée(s) pour cette date",
            count: response.data.length
          }),
          "success"
        );
      } else {
        setAvailableOperations([]);
        setDateConfirmed(true);
        showToast(
          t("sessionManager.noOperationFound", "Aucune opération trouvée pour cette date"),
          "info"
        );
      }
    } catch (error) {
      console.error("Error fetching operations:", error);
      showToast(t("sessionManager.fetchOperationsError", "Erreur lors de la récupération des opérations"), "error");
    } finally {
      setIsLoadingOperations(false);
    }
  };

  const handleToggleOperation = (operation) => {
    const operationId = operation.id || operation.OperationId;
    setSelectedOperations(prev => {
      const isSelected = prev.some(op => (op.id || op.OperationId) === operationId);
      if (isSelected) {
        return prev.filter(op => (op.id || op.OperationId) !== operationId);
      } else {
        return [...prev, operation];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOperations.length === availableOperations.length) {
      setSelectedOperations([]);
    } else {
      setSelectedOperations([...availableOperations]);
    }
  };

  const toggleOperationExpand = (operationId) => {
    setExpandedOperations(prev => ({
      ...prev,
      [operationId]: !prev[operationId]
    }));
  };

  const handleBackToDate = () => {
    setDateConfirmed(false);
    setAvailableOperations([]);
    setSelectedOperations([]);
  };

  const handleCreateSession = async () => {
    if (selectedOperations.length === 0) {
      showToast(t("sessionManager.selectAtLeastOneOperation", "Veuillez sélectionner au moins une opération"), "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (onCreateSession) {
        const result = await onCreateSession({
          selectedDateTime,
          selectedOperations,
        });
        if (result && result.success) {
          setCreatedSessionId(result.sessionId);
        }
      }
    } catch (error) {
      console.error("Error in onCreateSession:", error);
      showToast(t("sessionManager.createSessionError", "Erreur lors de la création de la session"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("sessionManager.createSessionTitle", "Créer une session d'évaluation")}
      onSave={dateConfirmed && !createdSessionId ? handleCreateSession : undefined}
      saveText={createdSessionId
        ? ""
        : (dateConfirmed
          ? (isSubmitting ? t("sessionManager.sessionCreationInProgress", "Création en cours...") : t("sessionManager.createSessionButton", "Créer la session"))
          : undefined)
      }
      cancelText={t("common.cancel", "Annuler")}
      disableSave={isSubmitting || (dateConfirmed && selectedOperations.length === 0)}
    >
      <div className="space-y-4 text-[12px] sm:text-[13px] relative bg-white dark:bg-slate-900">
        {/* Loading Overlay */}
        <SubmitLoader
          isVisible={isSubmitting}
          message={t("sessionManager.creatingSession", "Création de la session en cours...")}
        />

        {createdSessionId ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t("sessionManager.sessionCreatedSuccessTitle", "Session créée avec succès")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("sessionManager.sessionDateTimeIs", "Date et heure de la session :")} <strong>{selectedDateTime}</strong>
            </p>
            <button
              onClick={() => {
                navigate(`/session/${createdSessionId}`);
                onClose();
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              {t("sessionManager.goToSessionDetails", "Accéder aux détails de la session")}
            </button>
          </div>
        ) : (
          <>

        {/* Date Selection Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-800 pb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-tight">
              {t("sessionManager.sessionDateAndTime", "Date et heure de la session")}
            </h4>
          </div>

          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={selectedDateTime}
              onChange={handleDateChange}
              disabled={dateConfirmed || isSubmitting}
              required
              className="flex-1 border border-gray-300 dark:border-slate-700 px-3 py-1.5 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-slate-850 disabled:text-gray-500 dark:disabled:text-slate-500"
            />

            {!dateConfirmed ? (
              <button
                onClick={handleConfirmDate}
                disabled={!selectedDateTime || isLoadingOperations || isSubmitting}
                className="px-4 py-1.5 bg-blue-600 text-white cursor-pointer rounded text-xs font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 dark:disabled:bg-blue-900/50 flex items-center gap-1.5 shadow-sm"
              >
                {isLoadingOperations ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t("sessionManager.loading", "Chargement...")}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>{t("common.confirm", "Confirmer")}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleBackToDate}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 cursor-pointer rounded text-xs font-semibold hover:bg-gray-200 dark:hover:bg-slate-750 transition disabled:opacity-50 border border-gray-200 dark:border-slate-700"
              >
                {t("common.modify", "Modifier")}
              </button>
            )}
          </div>
        </div>

        {/* Operations Selection Section - Only show after date is confirmed */}
        {dateConfirmed && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                  {t("sessionManager.operationsToEvaluate", "Opérations à évaluer")}
                </h4>
              </div>

              {availableOperations.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50">
                    {t("sessionManager.selectedOfTotal", {
                      selected: selectedOperations.length,
                      total: availableOperations.length,
                      defaultValue: "{{selected}}/{{total}} sélectionnée(s)",
                    }).replace("{{selected}}", selectedOperations.length).replace("{{total}}", availableOperations.length)}
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={isSubmitting}
                    className="text-[10px] px-2.5 py-1 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
                  >
                    {selectedOperations.length === availableOperations.length
                      ? t("common.deselectAll", "Tout désélectionner")
                      : t("common.selectAll", "Tout sélectionner")}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 border border-gray-100 dark:border-slate-800 rounded-lg p-3 bg-gray-50/50 dark:bg-slate-900/50 shadow-inner">
              {isLoadingOperations ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 italic">
                  {t("sessionManager.loadingOperations", "Chargement des opérations...")}
                </div>
              ) : availableOperations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 italic">
                  {t("sessionManager.noOperationForDate", "Aucune opération disponible pour cette date")}
                </div>
              ) : (
                availableOperations.map((operation) => {
                  const operationId = operation.id || operation.OperationId;
                  const isSelected = selectedOperations.some(op => (op.id || op.OperationId) === operationId);
                  const isExpanded = expandedOperations[operationId];
                  const lots = operation.Lots || [];

                  return (
                    <div
                      key={operationId}
                      className={`border rounded-lg transition-all duration-200 ${isSelected 
                        ? 'border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-850 shadow-sm' 
                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-slate-700'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between p-2.5">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleOperation(operation)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-slate-700 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {operation.Numero}
                              </span>
                              {lots.length > 0 && (
                                <button
                                  onClick={() => toggleOperationExpand(operationId)}
                                  disabled={isSubmitting}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                                >
                                  {isExpanded ?
                                    <ChevronUp className="w-3.5 h-3.5" /> :
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lots Section - Expanded */}
                      {isExpanded && lots.length > 0 && (
                        <div className="px-3 pb-3 pt-0 space-y-1 animate-in slide-in-from-top-1 duration-200">
                          {lots.map((lot) => (
                            <div key={lot.id || lot.LotId} className="flex items-center gap-2.5 text-[10px] bg-gray-50 dark:bg-slate-800/50 p-2 rounded-md border border-gray-100 dark:border-slate-700/50 transition-colors hover:bg-white dark:hover:bg-slate-800">
                              <span className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-500 rounded-full shadow-sm"></span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{lot.NumeroLot || t("sessionManager.lot", "Lot")}</span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{lot.Designation || lot.description || t("sessionManager.noDescription", "Sans description")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </FormModal>
  );
};

export default SessionManagerModal;