import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import AdminTable from "../../components/Admins/AdminTable";
import NewAdminModal from "../../components/Admins/NewAdminModal";

import {
  fetchAdmins,
  createAdmin,
  toggleAdminState,
  deleteAdmin,
} from "../../services/Admin/adminService";
import { ConfirmDeleteModal } from "../../components/Shared/tools/DeleteConfirmation";
import MiniSidebar from "../../components/Shared/MiniSidebar";

function generateRandomPassword() {
  const base = Math.random().toString(36).slice(-8);
  return base.charAt(0).toUpperCase() + base.slice(1) + "!";
}

function AdminPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Modal state for deletion
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    Email: "",
    Password: generateRandomPassword(),
    Role: "admin",
    NomPrenom: "",
    Function: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const adminsData = await fetchAdmins();
        setAdmins(adminsData);
      } catch (error) {
        console.error("Failed to load admin accounts:", error);
        showToast(
          t("admins.loadError", "Erreur lors du chargement des comptes administrateurs."), 
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredAdmins = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return admins;

    return admins.filter((a) => {
      const buf = [
        a.email,
        a.nom_prenom,
        a.function,
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .join(" ");
      return buf.includes(term);
    });
  }, [admins, searchTerm]);

  const handleOpenModal = () => {
    setForm({
      Email: "",
      Password: generateRandomPassword(),
      Role: "admin",
      NomPrenom: "",
      Function: "",
    });
    setShowModal(true);
  };

  const handleSaveAdmin = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        email: form.Email,
        password: form.Password,
        nom_prenom: form.NomPrenom || null,
        function: form.Function || null,
      };

      const res = await createAdmin(payload);
      if (res.success) {
        if (res.admin) {
          setAdmins((prev) => [...prev, res.admin]);
        }
        showToast(
          t("admins.createdSuccess", "Compte administrateur créé avec succès."), 
          "success"
        );
        setShowModal(false);
        // Recharger la liste des admins
        const adminsData = await fetchAdmins();
        setAdmins(adminsData);
      } else {
        showToast(
          res.message || t("admins.createError", "Erreur lors de la création du compte."), 
          "error"
        );
      }
    } catch (err) {
      if (err.validationError) {
        showToast(err.validationError.join("\n"), "error");
      } else {
        showToast(
          t("common.toasts.serverError", "Erreur de connexion au serveur."), 
          "error"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleState = async (admin) => {
    try {
      // Activer (state = 1) si désactivé, Désactiver (state = 0) si activé
      const newState = admin.state ? 0 : 1;
      const res = await toggleAdminState(admin.id, newState);
      if (res.success && res.admin) {
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, ...res.admin } : a))
        );
        // Afficher un message de succès
        const message = newState === 1
          ? t("admins.activated", "Compte activé avec succès.")
          : t("admins.deactivated", "Compte désactivé avec succès.");
        showToast(message, "success");
      } else {
        showToast(
          res.message || t("admins.stateError", "Erreur lors de la mise à jour de l'état du compte."),
          "error"
        );
      }
    } catch (error) {
      showToast(
        t("common.toasts.serverError", "Erreur de connexion au serveur."),
        "error"
      );
    }
  };

  // Open delete modal
  const openDeleteConfirmation = (admin) => {
    setDeleteTarget(admin);
  };

  // Close delete modal
  const closeDeleteConfirmation = () => {
    setDeleteTarget(null);
  };

  // Handle delete confirm
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteAdmin(deleteTarget.id);
      if (res.success) {
        setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        showToast(
          res.message || t("admins.deleteSuccess", "Compte supprimé avec succès."), 
          "success"
        );
      } else {
        showToast(
          res.message || t("admins.deleteError", "Erreur lors de la suppression du compte."),
          "error"
        );
      }
    } catch (error) {
      showToast(
        t("common.toasts.serverError", "Erreur de connexion au serveur."),
        "error"
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
        <MiniSidebar />
        <div className="flex-1 overflow-y-auto p-8">
          {t("loading", "Chargement...")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <MiniSidebar />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-slate-200 mb-4">
          {t("admins.managementPageTitle", "Gestion des Comptes Administrateur")}
        </h1>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Admin accounts table */}
          <AdminTable
            admins={filteredAdmins}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenCreate={handleOpenModal}
            onToggleState={handleToggleState}
            onDeleteClick={openDeleteConfirmation}
          />
        </div>

        <NewAdminModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAdmin}
          form={form}
          setForm={setForm}
          isSubmitting={isSubmitting}
        />

        {/* DeleteConfirmation Modal */}
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          title={t("admins.deleteAccount", "Supprimer le compte administrateur")}
          message={
            deleteTarget
              ? (
                <span>
                  {t(
                    "admins.deleteConfirmMsg",
                    "Êtes-vous sûr de vouloir supprimer le compte administrateur :"
                  )}
                  <br />
                  <span className="font-semibold text-red-600">{deleteTarget.email}</span> ?
                  <br />
                  {t(
                    "admins.deleteWarning",
                    "Cette action est irréversible."
                  )}
                </span>
              )
              : ""
          }
          onClose={closeDeleteConfirmation}
          onConfirm={handleConfirmDelete}
          ButtonContext={t("common.delete", "Supprimer")}
        />
      </main>
    </div>
  );
}

export default AdminPage;
