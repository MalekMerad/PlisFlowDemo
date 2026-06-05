import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Hash, Megaphone, Plus } from "lucide-react";
import DetailRow from '../../components/Shared/Cards/DetailRowCard';
import { DetailsCard } from '../../components/Shared/Cards/DetailsCard';

import { updateOperation, validateOperationService, updateOperationState } from '../../services/Operations/operationService';
import { FormModal } from '../../components/Shared/FormModal';
import { NewOperationForm } from '../../components/Operations/NewOperationForm';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { validateAnnonce, deleteAnnonce, endAnnounceReception } from '../../services/Annonces/annonceService';

import { fetchOperationDetails } from '../../components/Operations/FetchOperationDetails';
import { getRetraitsWithSpecs } from '../../services/Retrait Cahier de charge/retraitService';

import { LotsSubSection } from '../../components/Lots/LotsSubSection';
import { ApPartitionsSubSection } from '../../components/Ap/ApPartitionsSubSection';
import { SpecificationsSection } from '../../components/Retriat Cahier de charge/SpecificationsSection';
import { AnnouncementSubSection } from '../../components/Annonces/AnnouncementSubSection';
import ArchivedAnnouncesTable from '../../components/Annonces/ArchivedAnnouncesTable';

import { Sidebar } from '../../components/Shared/Sidebar';
import { useTranslation } from 'react-i18next';

import { ConfirmValidateModal } from '../../components/Shared/tools/ValidateConfirmation';
import { formatDate, formatTime } from '../../utils/TimeDateFormat';
import {
  getBudgetTypeLabel,
  getModeAttribuationLabel,
  getTypeTravauxLabel
} from '../../utils/typeHandler';


const OperationDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const announcementRef = useRef();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'ar' ? 'ar-DZ' : (i18n.language === 'en' ? 'en-US' : 'fr-FR');

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

  const typeBudgetMap = {
    1: t('OperationNew.budgetTypeOption.equipement') || 'Equipement',
    2: t('OperationNew.budgetTypeOption.fonctionnement') || 'Fonctionnement',
    3: t('OperationNew.budgetTypeOption.opHorsBudget') || 'Opérations Hors Budget'
  };
  const modeAttribuationMap = {
    1: t('OperationNew.allocationMethodOption.ouvert') || "Appel d'Offres Ouvert",
    2: t('OperationNew.allocationMethodOption.restreint') || "Appel d'Offres Restreint",
  };
  const typeTravauxMap = {
    1: t('OperationNew.workTypeOption.travaux') || 'Travaux',
    2: t('OperationNew.workTypeOption.prestations') || 'Prestations',
    3: t('OperationNew.workTypeOption.equipement') || 'Equipement',
    4: t('OperationNew.workTypeOption.etude') || 'Etude'
  };

  const { showToast } = useToast();
  const { user } = useAuth();

  const [opId, setOpId] = useState(() =>
    id ||
    location.state?.operation?.id ||
    location.pathname.match(/(\d+)$/)?.[1] ||
    null
  );

  const [operation, setOperation] = useState(location.state?.operation || null);
  const [loading, setLoading] = useState(!location.state?.operation);
  const [fetchError, setFetchError] = useState(null);
  const [lots, setLots] = useState([]);
  const [apPartitions, setApPartitions] = useState([]); // ADDED
  const [showEditModal, setShowEditModal] = useState(false);

  const [showValidateOperationModal, setShowValidateOperationModal] = useState(false);
  const [showValidateAnnounceModal, setShowValidateAnnounceModal] = useState(false);

  const [editFormData, setEditFormData] = useState({});
  const [announces, setAnnounces] = useState([]);
  const [currentAnnounce, setCurrentAnnounce] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DERIVED LOGIC STATES (The Plan) ---
  const isOperationValidated = operation?.State === 1 || operation?.State === 3 || operation?.State === 4;
  const hasAnnounce = announces && announces.length > 0 && announces.some(ann => ann?.Status !== 0);
  const isAnnounceValidated = currentAnnounce?.Status === 1;
  const isReceptionEnded = Boolean(currentAnnounce?.ReceptionEnded);

  const refreshOperationData = async (isSilent = false) => {
    if (!opId) return;
    if (!isSilent) setLoading(true);
    try {
      const result = await fetchOperationDetails(opId);
      if (result.success && result.operation) {
        setOperation(result.operation);
        setLots(result.lots || []);
        setAnnounces(result.announces || []);

        // ADDED: Set AP Partitions from the result
        // Assuming fetchOperationDetails returns apPartitions
        // If not, you'll need to fetch them separately
        setApPartitions(result.apPartitions || []);

        // fetch specs for all announces
        let allSpecs = [];
        if (Array.isArray(result.announces)) {
          for (const ann of result.announces) {
            const res = await getRetraitsWithSpecs(ann.Id || ann.id);
            if (res.success) {
              allSpecs = [...allSpecs, ...res.data];
            }
          }
        }

        setSuppliers(allSpecs);

        setFetchError(null);
      } else {
        setFetchError(result.message || 'Failed to fetch operation data');
      }
    } catch (err) {
      setFetchError(err?.message || 'Unexpected error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (opId) {
      localStorage.setItem('opId', opId);
      refreshOperationData();
    }
  }, [opId]);

  useEffect(() => {
    if (announces) {
      const found = announces.find(ann => ann?.Status !== 0);
      setCurrentAnnounce(found || null);
    }
  }, [announces]);

  useEffect(() => {
    autoArchiveExpiredAnnouncements();
  }, [announces]);

  const handleOpenEditModal = () => {
    if (!operation) return;
    setEditFormData({
      NumOperation: operation.Numero || operation.NumOperation,
      ServContract: operation.Service_Contractant || operation.ServiceDeContract,
      Objectif: operation.Objet || operation.Objectif,
      TravalieType: getTypeTravauxLabel(operation.TypeTravaux ?? operation.TypeTravauxCode),
      BudgetType: getBudgetTypeLabel(operation.TypeBudget ?? operation.TypeBudgetCode),
      MethodAttribuation: getModeAttribuationLabel(
        operation.ModeAttribuation ?? operation.ModeAttributionCode
      ),
      VisaNum: operation.NumeroVisa || operation.VisaNumber,
      DateVisa: operation.DateVisa
        ? new Date(operation.DateVisa).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      Program: operation.Program || '',
      AP: operation.AP != null && operation.AP !== '' ? String(operation.AP) : '',
      adminId: user?.userId || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateOperation = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateOperation({ Id: opId, ...editFormData, adminID: user?.userId });
      if (result?.success || result?.code === 0) {
        showToast(t('operations.updatedSuccess'), 'success');
        setShowEditModal(false);
        refreshOperationData(true);
      } else {
        showToast(result?.message || t('operations.addError'), 'error');
      }
    } catch (error) {
      showToast(t('operations.connectionError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      setIsSubmitting(true);

      const result = await deleteAnnonce(id);

      if (result?.success) {
        showToast(t('announce.archiveSuccess') || "Annonce archivée avec succès.", "success");
        await updateOperationState(opId, 3);
        await refreshOperationData(true);
      } else {
        showToast(result?.message || t('announce.archiveError'), "error");
      }
    } catch (error) {
      showToast(t('announce.connectionError'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoArchiveExpiredAnnouncements = async () => {
    if (!announces || announces.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const ann of announces) {
      if (!ann?.Date_Overture || ann?.Status === 0) continue;

      const annDate = new Date(ann.Date_Overture);
      annDate.setHours(0, 0, 0, 0);

      if (annDate <= today && ann?.Status === 1) {
        try {
          await deleteAnnonce(ann.Id || ann.id);
          await updateOperationState(opId, 3);
          showToast(
            t('announce.autoArchive', { numero: ann.Numero, defaultValue: `Annonce N°${ann.Numero} archivée automatiquement.` }),
            "warning"
          );

          await refreshOperationData(true);
        } catch (error) {
          console.error("Auto archive error:", error);
        }
      }
    }
  };

  const handleValidateOperation = async () => {
    setShowValidateOperationModal(false);
    setIsSubmitting(true);
    try {
      const result = await validateOperationService(opId);
      if (result?.success) {
        showToast(t('operations.validatedSuccess'), 'success');
        await refreshOperationData(true);
      } else {
        showToast(result?.message || t('operations.validationError'), 'error');
      }
    } catch (err) {
      showToast(t('operations.connectionError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnnounceId = (ann) => {
    if (!ann) return null;
    const id = ann.Id ?? ann.id ?? ann.ID;
    if (id == null || id === '' || id === 'null') return null;
    return String(id);
  };

  const handleEndReception = async () => {
    if (!currentAnnounce) return;
    const announceId = getAnnounceId(currentAnnounce);
    if (!announceId) {
      showToast(t('announce.receptionEndedError', 'Identifiant annonce manquant.'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await endAnnounceReception(announceId);
      if (result?.success) {
        showToast(t('announce.receptionEndedSuccess', 'Réception des cahiers des charges clôturée.'), 'success');
        await updateOperationState(opId, 3);
        await refreshOperationData(true);
      } else {
        showToast(result?.message || t('announce.receptionEndedError', 'Erreur lors de la clôture de la réception.'), 'error');
      }
    } catch (error) {
      showToast(t('announce.connectionError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateAnnounce = async () => {
    if (!currentAnnounce) return;
    const announceId = getAnnounceId(currentAnnounce);
    if (!announceId) {
      showToast(t('announce.validationError', 'Impossible de valider : identifiant annonce manquant.'), 'error');
      return;
    }
    setShowValidateAnnounceModal(false);
    setIsSubmitting(true);
    try {
      const result = await validateAnnonce(announceId);
      if (result?.success) {
        showToast(t('announce.validatedSuccess'), 'success');
        await refreshOperationData(true);
      } else {
        showToast(result?.message || t('announce.validationError'), 'error');
      }
    } catch (error) {
      console.error('Validate announce error:', error);
      showToast(error?.message || t('announce.connectionError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-transparent transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500"></div>
        <p className="text-gray-400 dark:text-slate-500 text-xs italic">{t('loading')}</p>
      </div>
    );
  }

  if (fetchError || !operation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-transparent transition-colors">
        <p className="text-red-500 dark:text-red-400 text-sm font-medium">{fetchError || t('operationDetails.noData')}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft size={14} /> {t('operationDetails.back')}
        </button>
      </div>
    );
  }

  // Méthode pour filtrer les spécifications liées à l'annonce actuelle (annonce status = 1)
  const filterSpecificationsByCurrentAnnounce = (specifications, currentAnnounce) => {
    if (!specifications || !currentAnnounce) return [];
    // Filtrer les spécifications qui appartiennent à l'annonce actuelle (status = 1)
    return specifications.filter(
      (spec) =>
        (spec.AnnonceID === currentAnnounce.id || spec.AnnonceID === currentAnnounce.Id) &&
        (currentAnnounce.Status === 1)
    );
  };

  return (
    <>
      <Sidebar activeSection="operations" />

      <ConfirmValidateModal
        isOpen={showValidateOperationModal}
        onClose={() => setShowValidateOperationModal(false)}
        onConfirm={handleValidateOperation}
        title={t('operations.confirmValidationTitle') || "Validation Operation"}
        message={t('operations.confirmValidationMsg') || "Êtes-vous sûr de vouloir valider cette opération ?"}
        ButtonContext={t('validate') || "Valider"}
      />

      <ConfirmValidateModal
        isOpen={showValidateAnnounceModal}
        onClose={() => setShowValidateAnnounceModal(false)}
        onConfirm={handleValidateAnnounce}
        title={t('announce.confirmValidationTitle') || "Validation de l'annonce"}
        message={
          currentAnnounce?.numero
            ? t('announce.confirmValidationMsg', { numero: currentAnnounce.numero }) ||
            `Êtes-vous sûr de vouloir valider l'annonce n°${currentAnnounce.numero} ?`
            : t('announce.confirmValidationMsgFallback') || "Êtes-vous sûr de vouloir valider cette annonce ?"
        }
        ButtonContext={t('validate') || "Valider"}
      />

      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="p-8 max-w-[1600px] mx-auto flex-1">
          {/* HEADER SECTION */}
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-8">
            <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="w-fit text-slate-500 dark:text-slate-400 font-medium text-xs border-l-4 border-gray-900 dark:border-slate-300 pl-4 bg-slate-50 dark:bg-slate-900/50 py-1 mb-2 transition-colors">
                  {t('operationDetails.operationNumber')} : {operation?.Numero}
                </div>
                <p className="text-sm lg:text-base text-slate-800 dark:text-slate-100 font-semibold mb-1">
                  <span className="text-slate-400 dark:text-slate-500 font-normal">{t('operationDetails.object')} : </span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium italic">
                    {operation?.Objet || operation?.Objectif || <span className="italic text-gray-400 dark:text-slate-500">{t('operationDetails.noObject')}</span>}
                  </span>
                </p>
              </div>

              <div className="mt-3 lg:mt-0 lg:ml-6 flex-shrink-0">
                {/* 2- Show Create New Announce ONLY if Operation is validated AND no announce exists */}
                {operation?.State === 1 && !hasAnnounce && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white text-xs font-bold rounded-md shadow-sm transition-all cursor-pointer"
                    onClick={() => announcementRef.current?.openAddModal()}
                  >
                    <Plus size={16} className="mr-2" />
                    {t('operationDetails.addAnnouncement')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT SIDEBAR */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-4 lg:sticky lg:top-12 lg:self-start">

              {/* OPERATION CARD: 1- Buttons hide once validated */}
              <DetailsCard
                leading={<div className="w-0.5 h-4 rounded-full bg-green-600" />}
                cardTitle={`Nº : ${operation?.Numero || operation?.NumOperation}`}
                statusCode={operation?.State}
                onValidate={() => setShowValidateOperationModal(true)}
                onModify={handleOpenEditModal}
                Icon={Hash}
                showButton={!isOperationValidated}
                disabled={isSubmitting}
              >
                <div className="p-4 bg-white dark:bg-slate-900 transition-colors">
                  <DetailRow
                    label={t('operationDetails.service')}
                    value={t(operation.Service_Contractant || operation.ServiceDeContract) || operation.Service_Contractant || operation.ServiceDeContract || t('header.n_a')}
                  />
                  <DetailRow
                    label={t('operationDetails.type')}
                    value={typeTravauxMap[operation.TypeTravaux] || t('header.n_a')}
                  />
                  <DetailRow
                    label={t('operationDetails.budget')}
                    value={typeBudgetMap[operation.TypeBudget] || t('header.n_a')}
                  />
                  <DetailRow
                    label={t('operationDetails.attribution')}
                    value={modeAttribuationMap[operation.ModeAttribuation] || t('header.n_a')}
                  />
                  <DetailRow
                    label={t('operationDetails.visaNumber')}
                    value={operation.NumeroVisa || operation.VisaNumber || t('header.n_a')}
                  />
                  <DetailRow
                    label={t('operationDetails.visaDate')}
                    value={operation.VisaDate ? formatDate(operation.VisaDate, currentLocale) : (operation.DateVisa ? formatDate(operation.DateVisa, currentLocale) : t('header.n_a'))}
                  />
                  <DetailRow
                    label={t('operationDetails.AP')}
                    value={formatCurrency(operation.AP, currentLocale)}
                  />
                  <DetailRow
                    label={t('operationDetails.program')}
                    value={operation.Program || t('header.n_a')}
                  />
                </div>
              </DetailsCard>

              {/* ANNOUNCE CARD: Only show if there's an announcement */}
              {(operation?.State === 1 && currentAnnounce && !currentAnnounce?.ReceptionEnded) && (
                <DetailsCard
                  cardTitle={t('operationDetails.announcement')}
                  statusCode={currentAnnounce?.Status}
                  onValidate={() => setShowValidateAnnounceModal(true)}
                  onModify={() => announcementRef.current?.openEditModal(currentAnnounce)}
                  leading={<div className="w-0.5 h-4 bg-orange-500 rounded-sm" />}
                  Icon={Megaphone}
                  showButton={!isAnnounceValidated}
                  disabled={isSubmitting}
                >
                  <div className="p-4 bg-white dark:bg-slate-900 transition-colors">
                    <DetailRow label={t('operationDetails.announcementNumber')} value={currentAnnounce.Numero || t('header.n_a')} />
                    <DetailRow label={t('operationDetails.journal')} value={currentAnnounce.Journal || t('header.n_a')} />
                    <DetailRow
                      label={t('operationDetails.publicationDate')}
                      value={currentAnnounce.Date_Publication ? formatDate(currentAnnounce.Date_Publication, currentLocale) : t('header.n_a')}
                    />
                    <DetailRow
                      label={t('operationDetails.opening')}
                      value={
                        (currentAnnounce.Date_Overture ? formatDate(currentAnnounce.Date_Overture, currentLocale) : "") +
                        (currentAnnounce.Heure_Ouverture ? (" " + t('operationDetails.openingAt') + " " + formatTime(currentAnnounce.Heure_Ouverture, currentLocale)) : "") || t('header.n_a')
                      }
                    />
                  </div>
                </DetailsCard>
              )}

              {isAnnounceValidated && !isReceptionEnded && (
                <button
                  type="button"
                  onClick={handleEndReception}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-md shadow-sm transition-all cursor-pointer text-center leading-snug"
                >
                  <span className="block">{t('announce.endReceptionFr', 'Clôture de réception')}</span>
                  <span className="block opacity-90">{t('announce.endReceptionEn', 'Accusition ending')}</span>
                  <span className="block opacity-90" dir="rtl">{t('announce.endReceptionAr', 'انهاء الاستقبال')}</span>
                </button>
              )}

              {isReceptionEnded && (
                <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-[10px] text-slate-600 dark:text-slate-400 text-center font-semibold">
                  {t('announce.receptionClosed', 'Réception clôturée — aucun nouveau retrait accepté')}
                </div>
              )}
            </aside>

            {/* RIGHT CONTENT */}
            <main className="flex-1 w-full space-y-6">
              <AnnouncementSubSection
                ref={announcementRef}
                operationID={opId}
                Annonces={announces}
                refreshData={() => refreshOperationData(true)}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />

              {/* ADDED: AP Partitions Section - Shows BEFORE Lots, button shown only before operation validation */}
              <ApPartitionsSubSection
                operationID={opId}
                IsOperationActive={operation?.State !== 2}
                refreshData={() => refreshOperationData(true)}
                showButton={!isOperationValidated}
                readOnly={isOperationValidated}
                operationAP={operation.AP}
              />

              {/* 1- Lot button shown only before operation validation */}
              <LotsSubSection
                operationID={opId}
                Lots={lots}
                refreshData={() => refreshOperationData(true)}
                showButton={!isOperationValidated}
                readOnly={isOperationValidated}
              />

              {/* 4- SpecificationSection shown only after announce validation */}
              {/* Afficher sur cette table les spécifications de l'annonce validée */}
              {(operation?.State === 1 && isAnnounceValidated) && (
                <SpecificationsSection
                  operationID={opId}
                  Specifications={filterSpecificationsByCurrentAnnounce(suppliers, currentAnnounce)}
                  refreshData={() => refreshOperationData(true)}
                  showButton={isAnnounceValidated && !isReceptionEnded}
                  canDelete={isAnnounceValidated && !isReceptionEnded}
                  announce={currentAnnounce}
                />
              )}

              {/* Table for archived annonces (shows after SpecificationsSection) */}
              <ArchivedAnnouncesTable
                announces={announces}
                suppliers={suppliers}
              />
            </main>
          </div>
        </div>
      </div>

      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateOperation}
        title={t('operations.editOperation')}
        saveText={t('edit')}
        isLoading={isSubmitting}
      >
        <NewOperationForm
          newOperationData={editFormData}
          setNewOperationData={setEditFormData}
          isEditing={true}
        />
      </FormModal>
    </>
  );
};

export default OperationDetails;