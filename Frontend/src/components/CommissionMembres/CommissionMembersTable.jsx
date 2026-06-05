import { useState } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { Pagination } from "../Shared/tools/Pagination";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteModal } from "../Shared/tools/DeleteConfirmation";

const getRoleBadgeColor = (role) => {
  switch (role?.toLowerCase()) {
    case "président":
    case "president":
      return "text-orange-500";
    case "secrétaire":
    case "secretaire":
      return "text-green-400";
    default:
      return "text-blue-400";
  }
};

function sortMembersByRole(members = []) {
  const roleVal = role =>
    role
      ? role.toLowerCase() === "président" || role.toLowerCase() === "president"
        ? 0
        : role.toLowerCase() === "secrétaire" || role.toLowerCase() === "secretaire"
          ? 1
          : 2
      : 2;
  return [...members].sort((a, b) => {
    const aVal = roleVal(a.role);
    const bVal = roleVal(b.role);
    if (aVal !== bVal) return aVal - bVal;
    const aName = `${a.prenom || ""} ${a.nom || ""}`.trim().toLowerCase();
    const bName = `${b.prenom || ""} ${b.nom || ""}`.trim().toLowerCase();
    return aName.localeCompare(bName);
  });
}

export function CommissionMembersTable({
  members,
  handleOpenModal,
  handleDeleteMember,
}) {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const membersPerPage = 10;

  const sortedMembers = sortMembersByRole(members);
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = sortedMembers.slice(indexOfFirstMember, indexOfLastMember);

  const T_FULLNAME = t("commissionMembersTable.fullName", { defaultValue: "Nom complet" });
  const T_FUNCTION = t("commissionMembersTable.function", { defaultValue: "Fonction" });
  const T_ROLE = t("commissionMembersTable.role", { defaultValue: "Rôle" });
  const T_EMAIL = t("commissionMembersTable.email", { defaultValue: "Email" });
  const T_ACTIONS = t("commissionMembersTable.actions", { defaultValue: "Actions" });
  const T_NO_MEMBERS = t("commissionMembersTable.noMembers", { defaultValue: "Aucun membre trouvé." });
  const T_EDIT = t("common.modify", { defaultValue: "Modifier" });
  const T_DELETE = t("common.delete", { defaultValue: "Supprimer" });

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      handleDeleteMember(deleteId);
      setDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800/50">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
                {T_FULLNAME}
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
                {T_FUNCTION}
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
                {T_ROLE}
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
                {T_EMAIL}
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
                {T_ACTIONS}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-2 sm:px-4 py-8 text-center text-gray-400 dark:text-slate-500 text-xs sm:text-sm italic"
                >
                  {T_NO_MEMBERS}
                </td>
              </tr>
            ) : (
              currentMembers.map((member, idx) => (
                <tr
                  key={member.id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-center border-b border-gray-100 dark:border-slate-800/50 last:border-0"
                >
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {member.prenom} {member.nom}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {member.fonction}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-bold">
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold rounded-full ${getRoleBadgeColor(
                        member.role
                      )} dark:bg-opacity-20 border dark:border-current`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {member.email}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
                        title={T_EDIT}
                        aria-label={T_EDIT}
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(member.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
                        title={T_DELETE}
                        aria-label={T_DELETE}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {members.length > membersPerPage && (
        <Pagination
          itemsPerPage={membersPerPage}
          totalItems={members.length}
          paginate={setCurrentPage}
          currentPage={currentPage}
        />
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("commissionMembersTable.deleteMemberTitle", "Supprimer le membre")}
        message={t(
          "commissionMembersTable.deleteMemberMsg",
          "Êtes-vous sûr de vouloir supprimer ce membre ?"
        )}
      />
    </div>
  );
}