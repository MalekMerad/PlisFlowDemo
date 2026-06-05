import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '../Shared/FormModal';
import SearchableDropdown from '../Shared/SearchableDropdown';

const EvaluationFormModal = ({
  isOpen,
  onClose,
  suppliers = [],
  lots = [],
  selectedSupplier,
  selectedLot,
  scores,
  onLotChange,
  onSupplierChange,
  onScoreChange,
  onSubmit,
  isSubmitting
}) => {
  const { t } = useTranslation();
  const [rejectionReason, setRejectionReason] = useState('');
  const [observation, setObservation] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRejectionReason('');
      setObservation('');
    }
  }, [isOpen]);

  // Administrative score is now 1 (accepted) or 0 (rejected)
  const isAdminAccepted = scores.administrative === 1;
  const isAdminRejected = scores.administrative === 0;
  const isAdminDecisionMade = isAdminAccepted || isAdminRejected;

  const handleSubmit = () => {
    // Add rejection reason to the submission if rejected
    if (isAdminRejected) {
      onSubmit({ rejectionReason });
    } else if (isAdminAccepted) {
      onSubmit({ observation });
    } else {
      onSubmit({});
    }
  };

  // Filter functions for searchable dropdowns
  const filterSupplier = (supplier, searchTerm) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      supplier.Nom?.toLowerCase().includes(searchLower) ||
      supplier.Nif?.toLowerCase().includes(searchLower) ||
      supplier.Rc?.toLowerCase().includes(searchLower)
    );
  };

  const filterLot = (lot, searchTerm) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lot.NumeroLot?.toLowerCase().includes(searchLower) ||
      lot.Designation?.toLowerCase().includes(searchLower)
    );
  };

  // Render functions for dropdown options
  const renderSupplierOption = (supplier) => (
    <span className="text-xs">
      {supplier.Nom} - {supplier.Nif || supplier.Rc || t('evaluationForm.not_available', 'N/A')}
    </span>
  );

  const renderLotOption = (lot) => (
    <span className="text-xs">
      {lot.NumeroLot} - {lot.Designation?.substring(0, 20)}
      {lot.Designation?.length > 20 ? '...' : ''}
    </span>
  );

  // Handle lot selection with debug logging
  const handleLotChange = (lot) => {
    console.log('Lot selected in form:', lot);
    console.log('Lot ID:', lot?.id || lot?.Id);
    onLotChange(lot);
  };

  // Handle supplier selection with debug logging
  const handleSupplierChange = (supplier) => {
    console.log('Supplier selected in form:', supplier);
    console.log('Supplier ID:', supplier?.Id || supplier?.id);
    onSupplierChange(supplier);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={t('evaluationForm.addEvaluation', 'Ajouter une évaluation')}
      saveText={t('evaluationForm.add', 'Ajouter')}
      isSaving={isSubmitting}
    >
      <div className="space-y-3">
        {/* Supplier Select - Searchable Dropdown */}
        <div>
          <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            {t('evaluationForm.supplier', 'Fournisseur')} <span className="text-red-400">*</span>
          </label>
          <SearchableDropdown
            options={suppliers}
            value={selectedSupplier}
            onChange={handleSupplierChange}
            placeholder={t('evaluationForm.selectSupplier', 'Sélectionner un fournisseur')}
            renderOption={renderSupplierOption}
            filterFn={filterSupplier}
            getOptionKey={(supplier) => supplier.Id || supplier.id}
          />
        </div>

        {/* Lot Select - Searchable Dropdown (Only show if there are lots) */}
        {lots.length > 0 && (
          <div>
            <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('evaluationForm.lot', 'Lot')} <span className="text-red-400">*</span>
            </label>
            <SearchableDropdown
              options={lots}
              value={selectedLot}
              onChange={handleLotChange}
              placeholder={t('evaluationForm.selectLot', 'Sélectionner un lot')}
              renderOption={renderLotOption}
              filterFn={filterLot}
              getOptionKey={(lot) => lot.Id || lot.id}
            />
          </div>
        )}

        {/* Administrative Buttons */}
        <div>
          <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            {t('evaluationForm.adminDecision', 'Décision Administrative')} <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onScoreChange('administrative', 0)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-tight border transition ${scores.administrative === 0
                ? "bg-red-600 text-white border-red-600 shadow ring-1 ring-red-300"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-gray-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800"
                }`}
            >
              <X className="w-3 h-3" />
              {t('evaluationForm.reject', 'Rejeter')}
            </button>
            <button
              type="button"
              onClick={() => onScoreChange('administrative', 1)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-tight border transition ${scores.administrative === 1
                ? "bg-green-600 text-white border-green-600 shadow ring-1 ring-green-300"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-gray-300 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800"
                }`}
            >
              <Check className="w-3 h-3" />
              {t('evaluationForm.accept', 'Accepter')}
            </button>
          </div>
        </div>

        {/* Conditional Fields */}
        {isAdminAccepted && (
          <>
            {/* Technical Score */}
            <div>
              <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('evaluationForm.technicalScore', 'Note Technique')} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={scores.technique}
                onChange={(e) => onScoreChange('technique', e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                placeholder={t('evaluationForm.enterScore', 'Saisir la note')}
              />
            </div>

            {/* Financial Score */}
            <div>
              <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('evaluationForm.financialScore', 'Note Financière')} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={scores.financier}
                onChange={(e) => onScoreChange('financier', e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                placeholder={t('evaluationForm.enterScore', 'Saisir la note')}
              />
            </div>

            {/* Final Score */}
            <div>
              <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('evaluationForm.finalScore', 'Note Finale')} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={scores.final}
                onChange={(e) => onScoreChange('final', e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                placeholder={t('evaluationForm.enterScore', 'Saisir la note')}
              />
            </div>

            {/* Observation (Optional) */}
            <div>
              <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t('evaluationForm.observation', 'Observation')} <span className="text-gray-400 font-normal ml-1">{t('evaluationForm.optional', '(Optional)')}</span>
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows="2"
                className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                placeholder={t('evaluationForm.observationPlaceholder', 'Ajouter une observation...')}
              />
            </div>
          </>
        )}

        {/* Rejection Reason */}
        {isAdminRejected && (
          <div>
            <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('evaluationForm.rejectionReason', 'Motif de rejet')}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="2"
              className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
              placeholder={t('evaluationForm.rejectionReasonPlaceholder', 'Raison du rejet...')}
            />
            <div className="flex items-center gap-1 mt-1 text-amber-600">
              <AlertCircle className="w-2.5 h-2.5" />
              <span className="text-[8px]">
                {t('evaluationForm.reasonWillBeRecorded', 'Le motif sera enregistré')}
              </span>
            </div>
          </div>
        )}

        {/* Info message when no decision made */}
        {!isAdminDecisionMade && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 transition-colors">
            <p className="text-[9px] text-blue-700 dark:text-blue-400 flex items-center gap-1 italic">
              <AlertCircle className="w-2.5 h-2.5" />
              {t('evaluationForm.pleaseSelectDecision', 'Veuillez prendre une décision administrative')}
            </p>
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default EvaluationFormModal;