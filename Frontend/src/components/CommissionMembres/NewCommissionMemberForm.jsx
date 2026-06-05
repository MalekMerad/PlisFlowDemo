import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function NewCommissionMemberForm({ newMember, setNewMember, members = [], operations = [], selectedOperationId, setSelectedOperationId }) {
  const { t } = useTranslation();

  const [showNomSuggestions, setShowNomSuggestions] = useState(false);
  const [showPrenomSuggestions, setShowPrenomSuggestions] = useState(false);
  const [showOperationDropdown, setShowOperationDropdown] = useState(false);
  const [operationSearch, setOperationSearch] = useState('');

  const filteredOperations = useMemo(() => {
    if (!Array.isArray(operations)) return [];
    return operations.filter(op =>
      (op.Numero || '').toLowerCase().includes(operationSearch.toLowerCase()) ||
      (op.Service_Contractant || '').toLowerCase().includes(operationSearch.toLowerCase())
    );
  }, [operations, operationSearch]);

  const selectedOperation = operations?.find(
    op => String(op.Id || op.id) === String(selectedOperationId)
  );

  // Suggestions logic for UX
  const normalizedMembers = useMemo(() => {
    return (Array.isArray(members) ? members : [])
      .map(m => ({
        nom: (m?.nom || "").trim(),
        prenom: (m?.prenom || "").trim(),
        email: m?.email || "",
        fonction: m?.fonction || ""
      }));
  }, [members]);

  const filteredNoms = useMemo(() => {
    if (!newMember?.nom) return [];
    return [...new Set(normalizedMembers
      .filter(m => m.nom.toLowerCase().startsWith(newMember.nom.toLowerCase()))
      .map(m => m.nom))];
  }, [newMember?.nom, normalizedMembers]);

  const filteredPrenoms = useMemo(() => {
    if (!newMember?.prenom) return [];
    return [...new Set(normalizedMembers
      .filter(m => m.prenom.toLowerCase().startsWith(newMember.prenom.toLowerCase()))
      .map(m => m.prenom))];
  }, [newMember?.prenom, normalizedMembers]);

  return (
    <form
      id="new-commission-member-form"
      onSubmit={e => e.preventDefault()}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-xs font-medium mb-1 md:mb-0 whitespace-nowrap w-full md:w-[10%] min-w-[60px] dark:text-slate-300">
              {t("commission.nom", "Nom")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newMember.nom}
              onChange={e => setNewMember({ ...newMember, nom: e.target.value })}
              onFocus={() => setShowNomSuggestions(true)}
              className="block w-full md:flex-1 text-xs px-2 py-1.5 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 md:ml-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t("commission.nomPlaceholder", "Nom du membre")}
              autoComplete="off"
            />
          </div>
          {showNomSuggestions && filteredNoms.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-md max-h-32 overflow-y-auto mt-1">
              {filteredNoms.map((n, i) => (
                <li key={i}
                  className="p-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  onClick={() => { setNewMember({ ...newMember, nom: n }); setShowNomSuggestions(false); }}>{n}</li>
              ))}
            </ul>
          )}
        </div>
        {/* Prénom */}
        <div className="relative mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-xs font-medium mb-1 md:mb-0 whitespace-nowrap w-full md:w-[20%] min-w-[60px] dark:text-slate-300">
              {t("commission.prenom", "Prénom")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newMember.prenom}
              onChange={e => setNewMember({ ...newMember, prenom: e.target.value })}
              onFocus={() => setShowPrenomSuggestions(true)}
              className="block w-full md:flex-1 text-xs px-2 py-1.5 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 md:ml-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t("commission.prenomPlaceholder", "Prénom du membre")}
              autoComplete="off"
            />
          </div>
          {showPrenomSuggestions && filteredPrenoms.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-md max-h-32 overflow-y-auto mt-1">
              {filteredPrenoms.map((p, i) => (
                <li key={i}
                  className="p-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  onClick={() => { setNewMember({ ...newMember, prenom: p }); setShowPrenomSuggestions(false); }}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col md:flex-row md:items-center">
        <label className="text-xs font-medium mb-1 md:mb-0 md:w-[17%] whitespace-nowrap dark:text-slate-300">
          {t("commission.email", "Email")} <span className="text-red-500">*</span>
        </label>

        <input
          type="email"
          value={newMember.email}
          onChange={e => setNewMember({ ...newMember, email: e.target.value })}
          className="w-full md:flex-1 text-xs px-2 py-1.5 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t("commission.emailPlaceholder", "email@exemple.com")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fonction */}
        <div className="flex flex-col md:flex-row md:items-center">
          <label className="text-xs font-medium mb-1 md:mb-0 whitespace-nowrap w-full md:w-[26%] min-w-[20px] dark:text-slate-300">
            {t("commission.fonction", "Fonction")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newMember.fonction}
            onChange={e => setNewMember({ ...newMember, fonction: e.target.value })}
            className="block w-full md:flex-1 text-xs px-2 py-1.5 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 md:ml-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t("commission.fonctionPlaceholder", "Fonction du membre")}
          />
        </div>
        {/* Rôle */}
        <div className="flex flex-col md:flex-row md:items-center">
          <label className="text-xs font-medium mb-1 md:mb-0 whitespace-nowrap w-full md:w-[20%] min-w-[60px] dark:text-slate-300">
            {t("commission.role", "Rôle")} <span className="text-red-500">*</span>
          </label>
          <select
            value={newMember.role}
            onChange={e => setNewMember({ ...newMember, role: e.target.value })}
            className="block w-full md:flex-1 text-xs px-2 py-1.5 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 md:ml-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Président">{t("commission.rolePresident", "Président")}</option>
            <option value="Secrétaire">{t("commission.roleSecretaire", "Secrétaire")}</option>
            <option value="Membre">{t("commission.roleMembre", "Membre")}</option>
          </select>
        </div>
      </div>

    </form>
  );
}