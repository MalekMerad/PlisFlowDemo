import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, FileText, Download, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';

import {
  getSessionsWithOperationsService,
  getMembersBySessionService,
  updateSessionPresenceService,
  closeSessionEvaluationService
} from '../../services/Evaluation/evaluationServices';
import { getDocumentsBySessionAndOperationService } from '../../services/Documents/documentService';
import { getAllCommissionMembers } from '../../services/CommissionMembres/commissionMemberService';

import { Sidebar } from '../../components/Shared/Sidebar';
import LoadingState from '../../components/Shared/tools/LoadingState';
import ErrorState from '../../components/Shared/ErrorState';
import { ConfirmValidateModal } from '../../components/Shared/tools/ValidateConfirmation';
import OperationEvaluationTable from '../../components/Operations/OperationEvaluationTable';
import CommissionMembersBar from '../../components/CommissionMembres/CommissionMembersCard';

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  const [session, setSession] = useState(null);
  const [operations, setOperations] = useState([]);
  const [commissionMembers, setCommissionMembers] = useState([]);
  const [localPresence, setLocalPresence] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPresenceSaved, setIsPresenceSaved] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState([]);
  const [selectedOperationId, setSelectedOperationId] = useState('');
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(isPresenceSaved ? false : true);

  // Fetch Session Details
  const fetchSessionData = useCallback(async () => {
    if (!user || !user.userId) return;
    try {
      const response = await getSessionsWithOperationsService(user.userId);
      if (response && response.success && Array.isArray(response.data)) {
        const foundSession = response.data.find(s => s.SessionID === id);
        if (foundSession) {
          setSession(foundSession);
          setOperations(foundSession.operations || []);
        } else {
          setFetchError(t('evaluation.noSessionFound', { defaultValue: "Session introuvable" }));
        }
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      setFetchError(t('evaluation.errorFetchingSession', { defaultValue: "Erreur lors du chargement de la session" }));
    }
  }, [id, user, t]);

  const fetchCommissionMembers = useCallback(async () => {
    if (!id || !user?.userId) return;
    try {
      // First, try to get members from session presence
      const sessionResponse = await getMembersBySessionService(id);

      let members = [];

      if (sessionResponse?.success && Array.isArray(sessionResponse.members) && sessionResponse.members.length > 0) {
        // Session has members with their status
        setIsPresenceSaved(true);

        // Map the session members directly - they should now include Id
        members = sessionResponse.members.map(m => ({
          Id: m.Id,
          Nom: m.Nom,
          Prenom: m.Prenom,
          Role: m.Role,
          Status: m.Status
        }));
      } else {
        // No session members found, fetch all commission members and set them as present by default
        setIsPresenceSaved(false);

        const allMembersRes = await getAllCommissionMembers(user.userId);
        const allMembers = Array.isArray(allMembersRes) ? allMembersRes : (allMembersRes?.members || []);

        // Set all members as present by default (Status: 1)
        members = allMembers.map(m => ({
          Id: m.Id || m.id,
          Nom: m.Nom || m.nom,
          Prenom: m.Prenom || m.prenom,
          Role: m.Role || m.role,
          Status: 1 // Default to present
        }));
      }

      setCommissionMembers(members);
    } catch (error) {
      console.error("Error fetching commission members:", error);
      showToast(t('evaluation.errorFetchingMembers', { defaultValue: "Erreur lors du chargement des membres" }), "error");
    }
  }, [id, user, t, showToast]);

  const fetchDocuments = useCallback(async () => {
    if (!id || !selectedOperationId) {
      setGeneratedDocuments([]);
      return;
    }
    try {
      const response = await getDocumentsBySessionAndOperationService(id, selectedOperationId);
      if (response && response.success) {
        setGeneratedDocuments(response.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [id, selectedOperationId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSessionData(),
        fetchCommissionMembers()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, id]);

  useEffect(() => {
    if (operations.length > 0 && !selectedOperationId) {
      const firstOpId = operations[0].OperationID || operations[0].Id || operations[0].id || '';
      setSelectedOperationId(firstOpId);
    }
  }, [operations, selectedOperationId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Initialize localPresence based on commissionMembers
  useEffect(() => {
    const initialPresence = {};
    commissionMembers.forEach((member) => {
      const memberId = member.Id;
      // Status: 1 = present, 0 = absent
      initialPresence[memberId] = member.Status === 1;
    });
    setLocalPresence(initialPresence);
  }, [commissionMembers]);

  const handleTogglePresence = (memberId) => {
    if (isPresenceSaved) return;
    setLocalPresence((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const confirmSavePresence = async () => {
    setShowConfirmModal(false);
    let hasError = false;
    setShowDeleteButton(false);
    // Save each member's presence
    for (const [memberId, isPresent] of Object.entries(localPresence)) {
      try {
        const status = isPresent ? 1 : 0;
        await updateSessionPresenceService({
          SessionID: id,
          MemberID: memberId,
          Status: status
        });
      } catch (error) {
        hasError = true;
        console.error(`Failed to update presence for member ${memberId}`, error);
      }
    }

    if (hasError) {
      showToast(t("presenceModal.updateError", { defaultValue: "Erreur lors de la mise à jour de certaines présences" }), "error");
    } else {
      showToast(t("presenceModal.updateSuccess", { defaultValue: "Présences enregistrées avec succès" }), "success");
      setIsPresenceSaved(true);

      // Re-fetch to update the members with their saved Status values
      await fetchCommissionMembers();
    }
  };

  const handleEndSession = () => {
    setShowEndSessionConfirm(true);
  };

  const confirmEndSession = async () => {
    if (!id) return;

    setShowEndSessionConfirm(false);
    setIsClosingSession(true);

    try {
      const response = await closeSessionEvaluationService(id);
      if (response.success) {
        showToast(t('evaluation.sessionEndedSuccess', { defaultValue: "Session d'évaluation clôturée avec succès." }), "success");
        await fetchSessionData();
      } else {
        showToast(response.message || t('evaluation.endSessionError', { defaultValue: "Erreur lors de la clôture de la session." }), "error");
      }
    } catch (error) {
      console.error("Error closing session:", error);
      showToast(t('evaluation.endSessionError', { defaultValue: "Erreur lors de la clôture de la session." }), "error");
    } finally {
      setIsClosingSession(false);
    }
  };


  const formatSessionDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const lang = i18n.language?.substring(0, 2) || 'fr';
    const currentLocale = lang === 'ar' ? 'ar-DZ' : (lang === 'en' ? 'en-US' : 'fr-FR');

    return date.toLocaleDateString(currentLocale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) return <LoadingState />;
  if (fetchError) return <ErrorState message={fetchError} onBack={() => navigate(-1)} />;

  return (
    <>
      <Sidebar />
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
        <div className="flex-1 w-full overflow-x-auto">
          <div className="p-4 md:p-6 lg:p-8 w-full">
            <div className="space-y-4 w-full">

              <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

                {/* Left Column: Header & Presence UI */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                  {/* Session Info Header */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg py-2 px-3 shadow-sm transition-colors w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-1.5 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="truncate">
                          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" dir="auto">
                            {formatSessionDate(session?.SessionDateTime)}
                          </h2>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400">
                            {t('evaluation.operationCount', { count: operations.length, defaultValue: `${operations.length} Opérations` })}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {session?.EvaluationClosed !== 1 ? (
                          <button
                            onClick={handleEndSession}
                            disabled={isClosingSession || !isPresenceSaved}
                            className={`cursor-pointer flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded transition shadow-sm whitespace-nowrap ${(!isPresenceSaved || isClosingSession) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Check className="w-3 h-3" />
                            {t('evaluation.endSession', { defaultValue: 'Fin' })}
                          </button>
                        ) : (
                          <span className="px-2 py-1 text-red-700 text-[10px] font-semibold rounded flex items-center gap-1 whitespace-nowrap">
                            <Check className="w-3 h-3" />
                            {t('evaluation.sessionClosed', { defaultValue: 'Clôturée' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Presence UI */}
                  {isPresenceSaved ? (
                    <CommissionMembersBar members={commissionMembers} />
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg shadow-sm flex flex-col transition-colors w-full">
                      {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {t("presenceModal.title", "Membres de la commission")}
                        </h3>
                      </div>
                    </div>

                    {/* Summary Badge */}
                    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                        {t("presenceModal.summary", "Récapitulatif")}
                      </span>
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold border border-blue-100 dark:border-blue-800">
                        {Object.values(localPresence).filter(Boolean).length}/{commissionMembers.length} {t("presenceModal.present", "présents")}
                      </span>
                    </div>

                    {/* List Content */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] px-2 py-2 space-y-1 bg-white dark:bg-slate-900">
                      {commissionMembers.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 dark:text-slate-500 italic">
                          {t("presenceModal.noMember", "Aucun membre trouvé")}
                        </div>
                      ) : (
                        commissionMembers.map((member) => {
                          const memberId = member.Id;
                          const firstName = member.Prenom || '';
                          const lastName = member.Nom || '';
                          const role = member.Role || '';
                          const fullName = `${firstName} ${lastName}`.trim();
                          const isPresent = localPresence[memberId];

                          return (
                            <div
                              key={memberId}
                              className={`flex items-center justify-between rounded-md px-3 py-2 border transition-colors ${isPresent
                                ? 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                                : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                              <div className="flex flex-col pr-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                                  {fullName || t("presenceModal.noName", "Sans nom")}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 font-medium">{role}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePresence(memberId)}
                                disabled={isPresenceSaved}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all border ${isPresent
                                  ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-400 border-green-200 dark:border-green-800/50'
                                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                  } ${isPresenceSaved ? 'opacity-70 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'
                                  }`}
                              >
                                <Check className={`w-3.5 h-3.5 ${isPresent ? 'opacity-100' : 'opacity-0'}`} />
                                {isPresent
                                  ? t("presenceModal.presentBtn", "Présent")
                                  : t("presenceModal.absentBtn", "Absent")
                                }
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Action */}
                    {!isPresenceSaved && (
                      <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                        <button
                          onClick={handleSaveClick}
                          type="button"
                          className="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-tight bg-slate-700 dark:bg-slate-600 text-white shadow-sm hover:bg-slate-800 dark:hover:bg-slate-500 transition w-full cursor-pointer"
                        >
                          {t("presenceModal.savePresence", "Enregistrer les présences")}
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </div>

                {/* Right Column: Operations Table */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-colors w-full">
                    <div className="border-b border-gray-200 dark:border-slate-800 p-2.5 bg-gray-50 dark:bg-slate-800/30">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t('evaluation.operationsToEvaluate', { defaultValue: "Opérations associées à cette session" })}
                      </h4>
                    </div>
                    <div className="p-2.5 flex-1 bg-white dark:bg-slate-900 w-full overflow-x-auto">
                      {operations.length > 0 ? (
                        <OperationEvaluationTable
                          operations={operations}
                          sessionId={id}
                          sessionTime={session?.SessionDateTime}
                          disableBtn={!isPresenceSaved || session?.EvaluationClosed === 1}
                          isClosed={session?.EvaluationClosed === 1}
                          onDeleteSuccess={fetchSessionData}
                          showDeleteButton={!isPresenceSaved}
                        />
                      ) : (
                        <div className="text-center py-3.5 bg-gray-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                          <FileText className="w-6 h-6 text-gray-300 dark:text-slate-600 mx-auto mb-1.5" />
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 italic">
                            {t('evaluation.noOperationForSession', { defaultValue: "Aucune opération pour cette session" })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports Section */}
              <section className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg shadow-sm transition-colors w-full">
                <div className="border-b border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 px-2.5 py-2">
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">{t('evaluation.reportsAndMinutes', { defaultValue: "Rapports et PVs" })}</h2>
                </div>

                <div className="p-2.5 grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                  <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900">
                    <h3 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-tight">
                      {t('evaluation.selectOperation', { defaultValue: "Sélectionner une opération" })}
                    </h3>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {operations.map((op) => {
                        const opId = op.OperationID || op.Id || op.id;
                        const isSelected = selectedOperationId === opId;
                        return (
                          <button
                            key={opId}
                            type="button"
                            onClick={() => setSelectedOperationId(opId)}
                            className={`w-full text-left px-2 py-1.5 rounded border text-[11px] transition ${isSelected
                              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                              }`}
                          >
                            {op.Numero || opId}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-900/20 p-2.5 space-y-1.5">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-tight">
                        {t('evaluation.pvGenerationTitle', { defaultValue: 'Génération de PV' })}
                      </p>
                      <p className="text-[10px] text-amber-900/90 dark:text-amber-200/90 leading-snug">
                        <span className="font-semibold">FR :</span>{' '}
                        {t('evaluation.pvUnavailableFr', { defaultValue: "La génération des procès-verbaux n'est pas disponible pour le moment." })}
                      </p>
                      <p className="text-[10px] text-amber-900/90 dark:text-amber-200/90 leading-snug">
                        <span className="font-semibold">EN :</span>{' '}
                        {t('evaluation.pvUnavailableEn', { defaultValue: 'PV generation is not available at this time.' })}
                      </p>
                      <p className="text-[10px] text-amber-900/90 dark:text-amber-200/90 leading-snug" dir="rtl">
                        <span className="font-semibold">AR :</span>{' '}
                        {t('evaluation.pvUnavailableAr', { defaultValue: 'إنشاء محاضر الجلسة غير متاح حالياً.' })}
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900">
                    <h3 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1 uppercase tracking-tight">
                      {t('evaluation.generatedDocuments', { defaultValue: "Documents générés" })}
                    </h3>
                    <div className="space-y-1.5">
                      {!selectedOperationId ? (
                        <div className="text-[11px] text-gray-400 dark:text-slate-500 italic py-2.5 text-center bg-gray-50 dark:bg-slate-800/20 rounded border border-gray-200 dark:border-slate-800">
                          {t('evaluation.selectOperationToViewDocs', { defaultValue: "Sélectionnez une opération pour voir ses documents." })}
                        </div>
                      ) : generatedDocuments.length === 0 ? (
                        <div className="text-[11px] text-gray-400 dark:text-slate-500 italic py-2.5 text-center bg-gray-50 dark:bg-slate-800/20 rounded border border-gray-200 dark:border-slate-800">
                          {t('evaluation.noDocumentsGenerated', { defaultValue: "Aucun document généré pour cette opération" })}
                        </div>
                      ) : (
                        generatedDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                              <div>
                                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-tighter">
                                  {doc.DocumentType.replace('PV_', '')}
                                </div>
                                <div className="text-[9px] text-gray-500 dark:text-slate-500">
                                  {new Date(doc.GeneratedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'UTC'
                                  })}
                                </div>
                              </div>
                            </div>
                            <a
                              href={`http://localhost:5000${doc.FilePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-all hover:scale-110"
                              title="Télécharger"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmValidateModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSavePresence}
        title={t("presenceModal.confirmTitle", { defaultValue: "Confirmation de présence" })}
        message={t("presenceModal.confirmMessage", { defaultValue: "Êtes-vous sûr de vouloir valider les présences pour cette session ?" })}
        ButtonContext={t("common.confirm", { defaultValue: "Confirmer" })}
      />

      <ConfirmValidateModal
        isOpen={showEndSessionConfirm}
        onClose={() => setShowEndSessionConfirm(false)}
        onConfirm={confirmEndSession}
        title={t("common.confirmationTitle", { defaultValue: "Confirmation" })}
        message={t("evaluation.confirmEndSession", { defaultValue: "Êtes-vous sûr de vouloir clôturer l'évaluation pour toute la session ? Cette action est irréversible." })}
        ButtonContext={t('evaluation.endSession', { defaultValue: 'Fin d\'évaluation' })}
      />
    </>
  );
};

export default SessionDetails;