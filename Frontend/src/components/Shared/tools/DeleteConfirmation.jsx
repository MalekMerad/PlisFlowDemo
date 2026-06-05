import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  ButtonContext
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">
            {title || t('common.confirmationTitle', "Confirmation")}
          </h3>
          <button onClick={onClose} className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Line separator */}
        <div className="w-full h-0.5 bg-gray-400 dark:bg-slate-700 mb-4 w-100%"></div>
        {/* Message */}
        <p className="mb-6 text-sm text-gray-700 dark:text-slate-400">
          {message || t('common.confirmationMessage', "Êtes-vous sûr de vouloir supprimer cet élément ?")}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onConfirm}
            className="px-3 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 text-sm transition-colors"
          >
            {ButtonContext || t('common.delete', "Supprimer")}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded cursor-pointer text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm transition-colors"
          >
            {t('common.cancel', "Annuler")}
          </button>
        </div>
      </div>
    </div>
  );
}
