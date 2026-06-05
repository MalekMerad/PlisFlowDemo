import React from 'react';
import { useTranslation } from 'react-i18next';

export function RetraitModal({
  isOpen,
  numeroRetrait,
  setNumeroRetrait,
  onConfirm,
  onCancel
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-lg mx-4 flex flex-col overflow-hidden animate-modal-fade-up">

        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {t('specificationsSection.Saisieretrait', 'Saisie du numéro de retrait')}
          </h3>
        </div>

        <div className="p-6">
          <label className="block mb-2 ml-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('specificationsSection.numeroRetrait', 'Numéro de retrait')} <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            type="text"
            value={numeroRetrait}
            onChange={(e) => setNumeroRetrait(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 outline-none transition-all"
            placeholder={t('specificationsSection.numeroRetraitPlaceholder', 'Ex: RT-2025-001')}
          />
        </div>

        <div className="flex gap-2 justify-end px-6 py-3 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 transition-colors">
          <button
            onClick={onConfirm}
            className={`${isArabic ? 'ml-auto' : 'mr-auto'} px-4 py-1.5 rounded text-xs font-bold bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white shadow-sm transition-all cursor-pointer`}
          >
            {t('common.confirm', 'Confirmer')}
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {t('common.cancel', 'Annuler')}
          </button>
        </div>

      </div>
      <style>
        {`
          @keyframes modal-fade-up {
            from { opacity: 0; transform: translateY(32px) scale(0.96);}
            to { opacity: 1; transform: translateY(0) scale(1);}
          }
          .animate-modal-fade-up {
            animation: modal-fade-up 0.25s cubic-bezier(0.4,0,0.2,1);
          }
        `}
      </style>
    </div>
  );
}