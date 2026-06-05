import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function SpecificationsTable({ specifications }) {
  const { t } = useTranslation();

  const safeSpecifications = Array.isArray(specifications) ? specifications : [];


  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="border border-gray-100 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 transition-colors shadow-sm">
          {safeSpecifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-400 dark:text-slate-500 text-[10px] rounded italic">
              {t('specificationsSection.noRetraitFound', 'Aucune Acquisition de cahier de charge trouvée.')}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
                {safeSpecifications.map((specification, idx) => {
                  const telOrMail =
                    (specification.Telephone && specification.Telephone.trim().length > 0)
                      ? specification.Telephone
                      : (specification.Email && specification.Email.trim().length > 0
                        ? specification.Email
                        : '/');

                  return (
                    <tr key={specification.Id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                      <td className="px-4 py-2.5 text-[10px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap w-[30%]" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-2">#</span>
                        {specification.NumeroRetrait}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] text-slate-800 dark:text-slate-300 break-words w-[70%]" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                        <div className="font-bold flex items-center gap-1">
                          {specification.Nom}
                        </div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="opacity-70">{t('specificationsSection.telEmail', 'Tel/Email:')}</span>
                          <span className="font-medium underline decoration-slate-200 dark:decoration-slate-800">{telOrMail}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
