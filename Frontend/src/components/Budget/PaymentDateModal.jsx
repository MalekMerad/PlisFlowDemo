import { FormModal } from '../Shared/FormModal';

const PaymentDateModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  paymentDate,
  setPaymentDate,
  t
}) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Date de paiement"
      saveText="Enregistrer"
      disableSave={isSaving}
    >
      <div className="space-y-4 py-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          {t('budget.paymentDateModal.title')}
        </label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-slate-200"
        />
      </div>
    </FormModal>
  );
};

export default PaymentDateModal;
