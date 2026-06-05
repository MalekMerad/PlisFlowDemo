import React from "react";
import { CheckCircle, XCircle, Clock, Archive } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DetailsCard({
  cardTitle,
  statusCode,
  onValidate,
  onModify,
  children,
  leading,
  Icon,
  showButton,
  disabled, // Added missing prop
  validateButtonText // Custom text for validate button
}) {
  const { t } = useTranslation();

  const statusConfig = {
    0: {
      // Archived
      label: t("status.archived", "Archivé"),
      className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50",
      Icon: Archive,
    },
    1: {
      // Active
      label: t("status.active", "Active"),
      className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50",
      Icon: CheckCircle,
    },
    2: {
      // Preparation
      label: t("status.preparation", "En Préparation"),
      className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
      Icon: Clock,
    },
    3: {
      // Ouvert
      label: t("status.open", "Sous ouverture"),
      className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
      Icon: CheckCircle,
    },
    4: {
      label: t("status.gestion budgetaire", "gestion budgetaire"),
      className: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50",
      Icon: CheckCircle,
    },
  };

  const status = statusConfig[statusCode] || {
    label: t("status.unknown", "Inconnu"),
    className: "bg-gray-200 text-gray-600",
    Icon: XCircle,
  };

  const StatusIcon = status.Icon;

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
      <section className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded shadow-sm overflow-hidden transition-colors">
        <div className="border-b border-gray-300 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between min-h-[40px]">
          <div className="flex items-center gap-2">
            {leading}
            {Icon && <Icon className="text-slate-500 dark:text-slate-400" size={12} />}
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">
              {cardTitle}
            </h2>
          </div>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${status.className}`}
          >
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>
        {children}
        <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 grid grid-cols-2 gap-2">
          {showButton && !disabled && (
            <button
              className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold uppercase hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              onClick={onModify}
              type="button"
              disabled={disabled}
            >
              {t("edit", "Modifier")}
            </button>
          )}

          {showButton && !disabled && (
            <button
              className="px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500 shadow-sm"
              onClick={onValidate}
              type="button"
            >
              {validateButtonText || t("announcementSubSection.Valider", "Valider")}
            </button>
          )}
        </div>
      </section>
    </aside>
  );
}