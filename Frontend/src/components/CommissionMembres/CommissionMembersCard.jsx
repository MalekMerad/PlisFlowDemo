import React, { useState } from 'react';
import { Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CommissionMembersBar = ({
  members = []
}) => {
  const { t } = useTranslation();
  const [startIndex, setStartIndex] = useState(0);

  const maxVisibleMembers = 5;
  const visibleMembers = members.slice(startIndex, startIndex + maxVisibleMembers);
  const hasMoreMembers = members.length > maxVisibleMembers;
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + maxVisibleMembers < members.length;

  const handleScrollLeft = () => {
    if (canScrollLeft) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleScrollRight = () => {
    if (canScrollRight) {
      setStartIndex(startIndex + 1);
    }
  };

  const getRoleColor = (role) => {
    // Use translated role labels as keys and compare with translations (use lowercased French/English, add Arabic if needed)
    const presidentRoles = [
      t('commissionMembersBar.role_president', { defaultValue: "Président" }).toLowerCase(),
      t('commissionMembersBar.role_president_en', { defaultValue: "President" }).toLowerCase(),
      "président",
      "president",
      "رئيس"
    ];
    const secretaryRoles = [
      t('commissionMembersBar.role_secretary', { defaultValue: "Secrétaire" }).toLowerCase(),
      t('commissionMembersBar.role_secretary_en', { defaultValue: "Secretary" }).toLowerCase(),
      "secrétaire",
      "secretaire",
      "secretary",
      "سكرتير"
    ];
    const currentRole = (role || "").toLowerCase();
    if (presidentRoles.includes(currentRole)) return 'text-purple-600 bg-purple-50';
    if (secretaryRoles.includes(currentRole)) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const T_MEMBERS_LABEL = t('commissionMembersBar.membersLabel', { defaultValue: t('commission.membersLabel', { defaultValue: "Membres commission:" }) });
  const T_NO_NAME = t('commissionMembersBar.noName', { defaultValue: t('commission.noName', { defaultValue: "Sans nom" }) });
  const T_DEFAULT_ROLE = t('commissionMembersBar.defaultRole', { defaultValue: t('commission.defaultRole', { defaultValue: "Membre" }) });
  // For extra members
  const othersCount = members.length - (startIndex + visibleMembers.length);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
              {T_MEMBERS_LABEL}
            </span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border dark:border-blue-800">
              {members.length}
            </span>
          </div>

          {/* Members carousel */}
          <div className="flex items-center gap-1">
            {/* Left scroll button */}
            {hasMoreMembers && (
              <button
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                className={`p-1 rounded transition ${canScrollLeft
                  ? 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  : 'text-gray-300 dark:text-slate-700 cursor-not-allowed'
                  }`}
                title={t('commissionMembersBar.previous', { defaultValue: "Précédent" })}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Member items */}
            <div className="flex items-center gap-2 overflow-hidden">
              {visibleMembers.map((member) => {
                const memberId = member.Id || member.id;
                const firstName = member.Prenom || member.prenom || '';
                const lastName = member.Nom || member.nom || '';
                const role = member.Role || member.role || T_DEFAULT_ROLE;
                const fullName = `${firstName} ${lastName}`.trim();
                const roleColor = getRoleColor(role);

                // Add dark mode variants if not present
                const darkRoleColor = roleColor
                  .replace('bg-', 'dark:bg-')
                  .replace('text-', 'dark:text-')
                  .replace('50', '900/30')
                  .replace('600', '400');

                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700"
                    title={`${fullName || T_NO_NAME} - ${role}`}
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-200 whitespace-nowrap">
                      {fullName || T_NO_NAME}
                    </span>
                    <span className={`text-[8px] px-1 py-0.5 rounded-full ${roleColor} ${darkRoleColor} whitespace-nowrap`}>
                      {t(`commissionMembersBar.role_${role.toLowerCase()}`, { defaultValue: role })}
                    </span>
                  </div>
                );
              })}
            </div>

            {hasMoreMembers && (
              <button
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                className={`p-1 rounded transition ${canScrollRight
                  ? 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  : 'text-gray-300 dark:text-slate-700 cursor-not-allowed'
                  }`}
                title={t('commissionMembersBar.next', { defaultValue: "Suivant" })}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {members.length > maxVisibleMembers && (
              <span className="text-xs text-gray-500 dark:text-slate-500 whitespace-nowrap">
                {/* e.g. "+2 autres", in translation: "+2 autres" (fr), "+2 آخرون" (ar) */}
                {t('commissionMembersBar.plusOthers', {
                  count: othersCount,
                  defaultValue: `+${othersCount} autres`
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommissionMembersBar; 