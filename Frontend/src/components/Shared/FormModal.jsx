import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FormModal({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  saveText = "Ajouter",
  cancelText = "Annuler",
  disableSave = false,
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-lg mx-2 max-h-[90vh] flex flex-col overflow-hidden animate-modal-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
            aria-label={t("closeModal")}
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 bg-white dark:bg-slate-900">
          {children}
        </div>
        {/* Footer */}
        <div className="flex gap-2 justify-end px-3 py-2 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <div className="flex-1 flex">
            {saveText.length !== 0 && (
              <button
                onClick={onSave}
                type="button"
                disabled={disableSave}
                className={`px-4 py-1.5 rounded text-xs font-bold text-white shadow transition whitespace-nowrap min-w-[min-content] ${disableSave
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 cursor-pointer'
                  }`}
              >
                {disableSave ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {saveText}
                  </span>
                ) : (
                  t(saveText === "Ajouter" ? "add" : saveText === "Sauvegarder" ? "save" : saveText)
                )}
              </button>
            )}

          </div>
          <button
            onClick={onClose}
            type="button"
            className="px-3 py-1 rounded text-xs font-medium cursor-pointer border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition ml-0 whitespace-nowrap min-w-[min-content]"
          >
            {t("cancel")}
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