import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteModal } from "../Shared/tools/DeleteConfirmation";
import { useTranslation } from "react-i18next";

// Fields to check for completeness - use EXACT field names from your database
const REQUIRED_FIELDS = [
  "Nom",
  "Telephone",
  "Email",
  "Adresse",
  "AgenceBancaire",
  "RaisonSocial",
  "dateDepot",
  "Ai",
  "NatureJuridique",
  "Nif",
  "Rc",
  "Rib",
];

function isSupplierComplete(supplier) {
  return REQUIRED_FIELDS.every((key) => {
    let value = supplier[key];
    if (key === 'dateDepot') {
      value = supplier.DateDepot || supplier.dateDepot;
    }
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    // For date fields, check if they exist and are valid
    if (key === "dateDepot") {
      return value !== null && value !== undefined && value !== "";
    }
    return value !== null && value !== undefined && value !== "";
  });
}
export function SuppliersTable({
  suppliers,
  handleModalOpen,
  handleDeleteSupplier,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { t } = useTranslation();

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      handleDeleteSupplier(selectedId);
      setSelectedId(null);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = (supplier) => {
    // We only need the ID for the supplier deletion service
    const supplierId = supplier.Id;

    if (!supplierId) {
      console.error("Missing ID for deletion:", supplier);
      return;
    }

    openDeleteModal(supplierId);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-transparent dark:border-slate-800 transition-colors">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700">
            <tr>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{t("suppliers.nomOrRaisonSociale", "Nom ou Raison Sociale")}</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{t("suppliers.telephone", "Téléphone")}</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{t("suppliers.email", "Email")}</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{t("suppliers.adresse", "Adresse")}</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{t("suppliers.status", "Status")}</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{t("suppliers.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-0 py-0">
                <hr className="border-t border-gray-300 dark:border-slate-700 my-0" />
              </td>
            </tr>
          </tbody>
          <tbody className="bg-white dark:bg-slate-900">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                  {t("suppliers.noSuppliersFound", "Aucun fournisseur trouvé.")}
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, idx) => {
                const complete = isSupplierComplete(supplier);
                return (
                  <tr
                    key={supplier.Id || idx}
                    className="hover:bg-gray-50 dark:hover:bg-slate-900 border-b border-gray-100 dark:border-slate-800 last:border-0 transition-colors text-center"
                  >
                    <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-slate-300">{supplier.Nom}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-slate-300">{supplier.Telephone}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-slate-300">{supplier.Email}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-slate-300">{supplier.Adresse}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={
                          complete
                            ? "inline-block px-3 py-1 text-xs rounded text-green-500"
                            : "inline-block px-3 py-1 text-xs rounded text-red-500"
                        }
                      >
                        {complete
                          ? t(
                            "suppliers.formComplete",
                            "Formulaire Complet"
                          )
                          : t(
                            "suppliers.formIncomplete",
                            "Formulaire Incomplet"
                          )}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => handleModalOpen(supplier)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
                          title={t("suppliers.modify", "Modifier")}
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors cursor-pointer"
                          title={t("suppliers.delete", "Supprimer")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={t("suppliers.deleteSupplierTitle", "Supprimer le fournisseur")}
        message={t(
          "suppliers.deleteSupplierMsg",
          "Êtes-vous sûr de vouloir supprimer ce fournisseur ?"
        )}
      />
    </div>
  );
}