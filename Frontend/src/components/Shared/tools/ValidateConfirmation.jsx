import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ConfirmValidateModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Validation",
  message = "Êtes-vous sûr de vouloir valider cet élément ?",
  ButtonContext = "Valider"
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">{t(title) || title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Decorative line */}
        <div className="w-full h-[1px] bg-gray-100 dark:bg-slate-800 mb-5"></div>

        {/* Message */}
        <p className="mb-8 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
          {t(message) || message}
        </p>

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg cursor-pointer text-xs font-bold shadow-sm shadow-green-200 dark:shadow-none transition-all"
          >
            {t('confirmValidateModal.buttonText') || ButtonContext}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-medium transition-all"
          >
            {t('common.cancel') || 'Annuler'}
          </button>

        </div>
      </div>
    </div>
  );
}
