import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { CommissionMembersTable } from "./CommissionMembersTable";
import { NewCommissionMemberForm } from "./NewCommissionMemberForm";
import { FormModal } from "../Shared/FormModal";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";

import {
  newCommissionMember,
  getAllCommissionMembers,
  deleteCommissionMember,
  updateCommissionMember,
} from "../../services/CommissionMembres/commissionMemberService";

import { SearchBar } from "../Shared/tools/SearchBar";
import { useTranslation } from "react-i18next";

export function CommissionSection() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMember, setEditMember] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [newMember, setNewMember] = useState({
    nom: "",
    prenom: "",
    fonction: "",
    role: "Membre",
    email: "",
    telephone: "",
  });
  // ------------------ Fetch Members ------------------
  useEffect(() => {
    if (!user?.userId) return;

    let isMounted = true;

    const fetchAllCommissionMembers = async () => {
      try {
        const res = await getAllCommissionMembers(user.userId);
        if (!isMounted) return;

        const rawMembers = Array.isArray(res)
          ? res
          : Array.isArray(res?.members)
            ? res.members
            : [];

        const normalizedMembers = rawMembers.map((m) => ({
          id: m.Id || m.id || "",
          nom: typeof m.Nom === "string" ? m.Nom.trim() : "",
          prenom: typeof m.Prenom === "string" ? m.Prenom.trim() : "",
          fonction: m.Fonction || "",
          role: m.Role || "",
          email: m.Email || "",
          telephone: m.Telephone || m.telephone || "",
        }));
        setMembers(normalizedMembers);
      } catch (err) {
        console.error("Fetch Commission Members Error:", err);
        showToast(
          t("commission.errorLoadMembers", "Erreur de chargement des membres"),
          "error"
        );
        setMembers([]);
      }
    };

    fetchAllCommissionMembers();
    return () => { isMounted = false; };
  }, [user?.userId]);

  // ------------------ Search Logic ------------------
  const searchFilteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    return (
      `${member.prenom} ${member.nom}`.toLowerCase().includes(term) ||
      (member.fonction || "").toLowerCase().includes(term) ||
      (member.email || "").toLowerCase().includes(term)
    );
  });

  // ------------------ Modal Handlers ------------------
  const handleOpenModal = (member) => {
    setShowModal(true);
    if (member) {
      setEditMember(member);
      setNewMember({ ...member });
    } else {
      setEditMember(null);
      setNewMember({
        nom: "",
        prenom: "",
        fonction: "",
        role: "Membre",
        email: "",
      });
    }
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditMember(null);
  };

  const handleSaveMember = async () => {
    if (!newMember.nom || !newMember.prenom || !newMember.email) {
      showToast(
        t(
          "commission.requiredFields",
          "Nom, Prénom, et Email sont requis"
        ),
        "error"
      );
      return;
    }

    const formData = {
      Nom: newMember.nom.trim(),
      Prenom: newMember.prenom.trim(),
      Fonction: newMember.fonction.trim(),
      Email: newMember.email.trim(),
      Role: newMember.role.trim(),
      adminId: user.userId,
    };
    console.log("Sending to API:", formData); // Debug line

    try {
      if (editMember) {
        const result = await updateCommissionMember(editMember.id, formData);
        if (result.success) {
          showToast(
            t("commission.memberUpdated", "Membre modifié"),
            "success"
          );
          setMembers(members.map((m) => m.id === editMember.id ? { ...m, ...newMember } : m));
        } else {
          showToast(result.message || t("common.toasts.error", "Une erreur est survenue"), "error");
        }
      } else {
        const result = await newCommissionMember(formData);
        if (result.success) {
          showToast(
            t("commission.memberAdded", "Membre ajouté"),
            "success"
          );
          setMembers([...members, { ...newMember, id: result.id || result.member?.Id }]);
        } else {
          showToast(result.message || t("common.toasts.error", "Une erreur est survenue"), "error");
        }
      }
      handleModalClose();
    } catch (err) {
      showToast(err.message || t("common.toasts.error", "Une erreur est survenue"), "error");
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      const result = await deleteCommissionMember(id);
      if (result.success) {
        showToast(
          t("commission.memberDeleted", "Membre supprimé"),
          "success"
        );
        setMembers(members.filter((m) => m.id !== id));
      }
    } catch (err) {
      showToast(err.message || t("common.toasts.error", "Une erreur est survenue"), "error");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen w-full">
      <div className="w-full">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {t('commission.listTitle', 'Liste des membres de la commission')}
        </h2>
        <section className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded shadow-sm w-full">
          <div className="border-b border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <SearchBar
                placeholder={t("commission.searchPlaceholder", "Rechercher un membre...")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            <div className="flex w-full sm:w-auto">
              <button
                onClick={() => handleOpenModal(null)}
                className="w-full sm:w-auto px-3 py-1 bg-slate-700 dark:bg-slate-700 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-600 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("commission.addMember", "Ajouter Membre")}
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 overflow-x-auto">
            {searchFilteredMembers.length > 0 ? (
              <CommissionMembersTable
                members={searchFilteredMembers}
                handleOpenModal={handleOpenModal}
                handleDeleteMember={handleDeleteMember}
              />
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                {searchTerm
                  ? t("commission.noMemberSearch", "Aucun membre ne correspond à votre recherche")
                  : t("commission.noMemberFound", "Aucun membre trouvé")}
              </div>
            )}
          </div>
        </section>
      </div>

      <FormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleSaveMember}
        title={editMember ? t("commission.editMember", "Modifier Membre") : t("commission.addMember", "Ajouter Membre")}
        saveText={editMember ? t("commission.edit", "Modifier") : t("commission.add", "Ajouter")}
      >
        <NewCommissionMemberForm
          newMember={newMember}
          setNewMember={setNewMember}
        />
      </FormModal>
    </div>
  );
}
