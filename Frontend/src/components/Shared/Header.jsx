import React from 'react';
import { ArrowLeft, Calendar, FileText, Building2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Header = ({
  operationNumber,
  sessionDateTime,
  serviceContractant,
  objet,
  onBack
}) => {
  const { t } = useTranslation();

  // Format the session date if it exists
  const formattedSessionDate = sessionDateTime
    ? new Date(sessionDateTime).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '')
    : t('header.not_configured');

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="px-4 py-2">

        {/* Main header content */}
        <div className="grid grid-cols-12 gap-3">
          {/* Left column - Session Info */}
          <div className="col-span-4 bg-gray-50 dark:bg-slate-800/50 rounded-md p-2">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-medium text-blue-700 uppercase tracking-wider">
                {t('header.operationNumber')}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-900 dark:text-slate-100">
                {operationNumber}
              </span>
            </div>
          </div>

          {/* Middle and Right columns - Service & Objet */}
          <div className="col-span-8 grid grid-cols-2 gap-3">
            {/* Service Contractant */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-md p-2">
              <div className="flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400" />
                <span className="text-[10px] font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('header.service')}
                </span>
              </div>
              <p className="text-xs text-gray-900 dark:text-slate-100 line-clamp-1">
                {serviceContractant || t('header.not_specified')}
              </p>
            </div>

            {/* Objet */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-md p-2">
              <div className="flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400" />
                <span className="text-[10px] font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('header.objet')}
                </span>
              </div>
              <p className="text-xs text-gray-900 dark:text-slate-100 line-clamp-2">
                {objet || t('header.not_specified')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;