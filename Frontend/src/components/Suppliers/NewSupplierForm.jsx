import { useTranslation } from "react-i18next";

export function NewSupplierForm({ newSupplier, setNewSupplier }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4 text-xs mt-2">
            {/* Row 1: Full Name + Raison Sociale */}
            <div className="grid grid-cols-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    {t("suppliers.fullName", "Full Name")} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={newSupplier.Nom}
                    onChange={e =>
                        setNewSupplier({ ...newSupplier, Nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                    placeholder={t("suppliers.nomPlaceholder", "Ex: Ahmed Benali")}
                />
            </div>
            <div className="grid grid-cols-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    {t("suppliers.raisonSocial", "Raison Sociale")} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={newSupplier.RaisonSocial || ''}
                    onChange={e =>
                        setNewSupplier({ ...newSupplier, RaisonSocial: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                    placeholder={t("suppliers.raisonSocialPlaceholder", "Ex: Société Benali SARL")}
                />
            </div>
            {/* Row 2: Téléphone & Email */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                        {t("suppliers.telephone", "Téléphone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={newSupplier.Telephone}
                        onChange={e =>
                            setNewSupplier({ ...newSupplier, Telephone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                        placeholder={t("suppliers.telephonePlaceholder", "Ex: 0661 02 03 04")}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                        {t("suppliers.email", "Email")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={newSupplier.Email}
                        onChange={e =>
                            setNewSupplier({ ...newSupplier, Email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                        placeholder={t("suppliers.emailPlaceholder", "Ex: fournisseur@email.com")}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    {t("suppliers.adresse", "Adresse")} <span className="text-red-500">*</span>
                </label>
                <input
                    value={newSupplier.Adresse}
                    onChange={e =>
                        setNewSupplier({ ...newSupplier, Adresse: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                    placeholder={t("suppliers.adressePlaceholder", "Ex: 10 Rue Pasteur, Annaba")}
                    type="text"
                />
            </div>
            <div className="grid grid-cols-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    {t("suppliers.dateDepot", "Date de dépôt")} <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={newSupplier.DateDepot || ''}
                    onChange={e =>
                        setNewSupplier({ ...newSupplier, DateDepot: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                />
            </div>
        </div>
    );
}
