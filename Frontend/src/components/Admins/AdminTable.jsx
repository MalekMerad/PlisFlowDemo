import { Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { SearchBar } from "../Shared/tools/SearchBar";
import { useTranslation } from "react-i18next";

export default function AdminTable({
  admins: filteredAdmins,
  searchTerm,
  setSearchTerm,
  onOpenCreate,
  onToggleState,
  onDeleteClick,
}) {
  // The rewritten props: onOpenCreate -> handleOpenModal, onToggleState -> handleToggleState, onDeleteClick -> openDeleteConfirmation
  const handleOpenModal = onOpenCreate;
  const handleToggleState = onToggleState;
  const openDeleteConfirmation = onDeleteClick;

  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded shadow-sm overflow-hidden transition-colors">
      <div className="border-b border-gray-300 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 px-6 py-4">
        <div className="flex justify-between items-center gap-4 w-full">
          <SearchBar
            placeholder={t("admins.searchPlaceholder", "Rechercher par nom, email ou fonction...")}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={handleOpenModal}
                className="px-3 py-1 bg-slate-700 dark:bg-slate-600 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-500 flex items-center gap-2 text-sm disabled:bg-slate-400 dark:disabled:bg-slate-700 cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> {t("admins.newAccount", "Nouveau Compte")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 text-center border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-2 text-center">{t("admins.nameAndSurname", "Nom et Prénom")}</th>
              <th className="px-4 py-2 text-center">{t("admins.email", "Email")}</th>
              <th className="px-4 py-2 text-center">{t("admins.function", "Fonction")}</th>
              <th className="px-4 py-2 text-center">{t("admins.status", "Statut")}</th>
              <th className="px-4 py-2 text-center">{t("admins.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 dark:text-slate-500"
                >
                  {t("admins.noAdminFound", "Aucun compte administrateur trouvé.")}
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 last:border-0 transition-colors text-center"
                >
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-slate-300">
                    {admin.nom_prenom || "-"}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-slate-300">
                    {admin.email}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-slate-300">
                    {admin.function || "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleToggleState(admin)}
                      className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                    >
                      {admin.state ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-500" />
                          <span>{t("admins.active", "Actif")}</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          <span>{t("admins.disabled", "Désactivé")}</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-slate-300">
                    <button
                      onClick={() => openDeleteConfirmation(admin)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                      title={t("admins.deleteAccount", "Supprimer le compte")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
