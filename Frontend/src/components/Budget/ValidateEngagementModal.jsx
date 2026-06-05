import { FormModal } from '../Shared/FormModal';

const ValidateEngagementModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  selectedEngagement,
  validationVisaCf,
  setValidationVisaCf,
  validationDate,
  setValidationDate,
  t
}) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Validation de l'engagement"
      saveText={isSaving ? 'Validation...' : 'Valider'}
      disableSave={isSaving}
    >
      <div className="space-y-4 py-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('budget.validationModal.message')}
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="text-slate-500">{t('budget.validationModal.reference')}</span>
            <span className="font-medium">{selectedEngagement?.cfVisaNumber}</span>
            <span className="text-slate-500">{t('budget.validationModal.amount')}</span>
            <span className="font-medium">{selectedEngagement?.amount}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            Numéro de Visa CF <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded bg-white dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-slate-500 outline-none transition-colors"
            placeholder="Ex: CF-2024-001"
            value={validationVisaCf}
            onChange={(e) => setValidationVisaCf(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            Date du Visa <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1.5 rounded bg-white dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-slate-500 outline-none transition-colors"
            value={validationDate}
            onChange={(e) => setValidationDate(e.target.value)}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ValidateEngagementModal;
