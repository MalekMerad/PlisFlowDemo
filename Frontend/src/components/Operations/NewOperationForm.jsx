import React from "react";
import { useTranslation } from "react-i18next";

export function NewOperationForm({ newOperationData, setNewOperationData, isEditing }) {
    const { t } = useTranslation();

    React.useEffect(() => {
        const defaults = {
            TravalieType: t('OperationNew.workTypeTravaux') || 'Travaux',
            BudgetType: t('OperationNew.budgetTypeEquipement') || 'Equipement',
            MethodAttribuation: t('OperationNew.methodAOOuvert') || "Appel d'Offres Ouvert"
        };

        const updatedData = { ...newOperationData };
        let needsUpdate = false;

        if (!newOperationData.TravalieType) {
            updatedData.TravalieType = defaults.TravalieType;
            needsUpdate = true;
        }
        if (!newOperationData.BudgetType) {
            updatedData.BudgetType = defaults.BudgetType;
            needsUpdate = true;
        }
        if (!newOperationData.MethodAttribuation) {
            updatedData.MethodAttribuation = defaults.MethodAttribuation;
            needsUpdate = true;
        }

        if (needsUpdate) {
            setNewOperationData(updatedData);
        }
    }, []);

    const handleTextChange = (field, value) => {
        setNewOperationData({ ...newOperationData, [field]: value });
    };

    return (
        <form
            id="new-operation-form"
            onSubmit={e => e.preventDefault()}
            className="space-y-3 text-xs"
        >
            {/* Operation Number */}
            <div className="flex items-center gap-2">
                <label className="font-medium whitespace-nowrap w-[28%] min-w-[110px] text-slate-700 dark:text-slate-300">
                    {t("OperationNew.operationNumber") || "Numéro d'opération"}
                    <span className="text-red-500"> *</span>
                </label>
                <input
                    type="text"
                    required
                    value={newOperationData.NumOperation || ''}
                    onChange={e => handleTextChange("NumOperation", e.target.value)}
                    className={`flex-1 px-2 py-1 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${isEditing ? 'cursor-default bg-gray-50 dark:bg-slate-800/50' : ''}`}
                    placeholder={t("OperationNew.operationNumberExample") || "Ex : 2024-00054"}
                    readOnly={!!isEditing}
                />
            </div>

            {/* Service */}
            <div className="flex items-center gap-2">
                <label className="font-medium whitespace-nowrap w-[28%] min-w-[110px] text-slate-700 dark:text-slate-300">
                    {t("OperationNew.passingService") || "Service des marchés"}
                    <span className="text-red-500"> *</span>
                </label>
                <input
                    type="text"
                    required
                    value={newOperationData.ServContract || ''}
                    onChange={e => handleTextChange("ServContract", e.target.value)}
                    className="flex-1 px-2 py-1 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t("OperationNew.contractServiceExample") || "Ex : Direction des Achats"}
                />
            </div>

            {/* Objective */}
            <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    {t("OperationNew.operationObjective") || "Objectif de l'opération"}
                    <span className="text-red-500"> *</span>
                </label>
                <textarea
                    required
                    value={newOperationData.Objectif || ''}
                    onChange={e => handleTextChange("Objectif", e.target.value)}
                    className="w-full h-20 px-2 py-1 border rounded resize-none border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t("OperationNew.objectiveExample") || "Ex : Amélioration de l'infrastructure..."}
                />
            </div>

            {/* 3 Selects */}
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        {t("OperationNew.workType") || "Type de travail"}
                        <span className="text-red-500"> *</span>
                    </label>
                    <select
                        required
                        value={newOperationData.TravalieType || 'Travaux'}
                        onChange={e => setNewOperationData({ ...newOperationData, TravalieType: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    >
                        <option value="Travaux">{t("OperationNew.workTypeOption.travaux") || "Travaux"}</option>
                        <option value="Prestations">{t("OperationNew.workTypeOption.prestations") || "Prestations"}</option>
                        <option value="Equipement">{t("OperationNew.workTypeOption.equipement") || "Equipement"}</option>
                        <option value="Etude">{t("OperationNew.workTypeOption.etude") || "Etude"}</option>
                    </select>
                </div>

                <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        {t("OperationNew.budgetType") || "Type de budget"}
                        <span className="text-red-500"> *</span>
                    </label>
                    <select
                        required
                        value={newOperationData.BudgetType || 'Equipement'}
                        onChange={e => setNewOperationData({ ...newOperationData, BudgetType: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    >
                        <option value="Equipement">{t("OperationNew.budgetTypeOption.equipement") || "Equipement"}</option>
                        <option value="Fonctionnement">{t("OperationNew.budgetTypeOption.fonctionnement") || "Fonctionnement"}</option>
                        <option value="Opérations Hors Budget">{t("OperationNew.budgetTypeOption.opHorsBudget") || "Opérations Hors Budget"}</option>
                    </select>
                </div>

                <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                        {t("OperationNew.allocationMethod") || "Méthode d'attribution"}
                        <span className="text-red-500"> *</span>
                    </label>
                    <select
                        required
                        value={newOperationData.MethodAttribuation || "Appel d'Offres Ouvert"}
                        onChange={e => setNewOperationData({ ...newOperationData, MethodAttribuation: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    >
                        <option value="Appel d'Offres Ouvert">{t("OperationNew.allocationMethodOption.ouvert") || "Appel d'Offres Ouvert"}</option>
                        <option value="Appel d'Offres Restreint">{t("OperationNew.allocationMethodOption.restreint") || "Appel d'Offres Restreint"}</option>
                    </select>
                </div>
            </div>

            {/* Program */}
            <div className="flex items-center gap-2">
                <label className="font-medium whitespace-nowrap w-[28%] min-w-[110px] text-slate-700 dark:text-slate-300">
                    {t("OperationNew.program") || "Programme"}
                </label>
                <input
                    type="text"
                    value={newOperationData.Program || ''}
                    onChange={e => setNewOperationData({ ...newOperationData, Program: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t("OperationNew.programPlaceholder") || "Ex : Programme de développement..."}
                />
            </div>

            {/* AP */}
            <div className="flex items-center gap-2">
                <label className="font-medium whitespace-nowrap w-[28%] min-w-[110px] text-slate-700 dark:text-slate-300">
                    {t("OperationNew.ap") || "Autorisation de Programme"}
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={newOperationData.AP || ''}
                    onChange={e => setNewOperationData({ ...newOperationData, AP: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t("OperationNew.apPlaceholder") || "Ex : 1500000.00"}
                />
            </div>

            {/* Visa Section */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <label className="font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {t("OperationNew.visaNumber") || "Numéro de visa"}
                        <span className="text-red-500"> *</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={newOperationData.VisaNum || ''}
                        onChange={e => setNewOperationData({ ...newOperationData, VisaNum: e.target.value })}
                        className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Ex : Visa-2025-220..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {t("OperationNew.visaDate") || "Date de visa"}
                        <span className="text-red-500"> *</span>
                    </label>
                    <input
                        type="date"
                        required
                        value={newOperationData.DateVisa || ''}
                        onChange={e => setNewOperationData({ ...newOperationData, DateVisa: e.target.value })}
                        className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </form>
    );
}