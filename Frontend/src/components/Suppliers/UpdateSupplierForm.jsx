import { useTranslation } from "react-i18next";

export function UpdateSupplierForm({ newSupplier, setNewSupplier }) {
    const { t } = useTranslation();

    const inputCls = "w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors";
    const labelCls = "block text-xs mb-0.5 text-slate-700 dark:text-slate-300";

    return (
        <div className="space-y-2">
            {/* Row 1:  Nom ou Raison Sociale && Nature juridique && Adresse */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs mb-0.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                  {t("suppliers.fullName", "Full Name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplier.Nom}
                  onChange={e =>
                    setNewSupplier({ ...newSupplier, Nom: e.target.value })
                  }
                  className={`flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors`}
                  placeholder={t("suppliers.nomPlaceholder", "Ex: Ahmed Benali")}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs mb-0.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                  {t("suppliers.raisonSocial", "Raison Sociale")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplier.RaisonSocial || ''}
                  onChange={e =>
                    setNewSupplier({ ...newSupplier, RaisonSocial: e.target.value })
                  }
                  className={`flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors`}
                  placeholder={t("suppliers.raisonSocialPlaceholder", "Ex: Société Benali SARL")}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>
                    {t("suppliers.natureJuridique", "Nature juridique")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSupplier.NatureJuridique}
                    onChange={e =>
                      setNewSupplier({
                        ...newSupplier,
                        NatureJuridique: e.target.value
                      })
                    }
                    className={inputCls}
                  >
                    <option>{t("suppliers.selectNatureJuridique", "Sélectionner")}</option>
                    <option>{t("suppliers.nature.sarl", "SARL")}</option>
                    <option>{t("suppliers.nature.eurl", "EURL")}</option>
                    <option>{t("suppliers.nature.spa", "SPA")}</option>
                    <option>{t("suppliers.nature.snc", "SNC")}</option>
                    <option>{t("suppliers.nature.entrepriseIndividuelle", "Entreprise individuelle")}</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t("suppliers.adresse", "Adresse")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={newSupplier.Adresse}
                    onChange={e =>
                      setNewSupplier({ ...newSupplier, Adresse: e.target.value })
                    }
                    className={inputCls}
                    placeholder={t("suppliers.adressePlaceholder", "Ex: 10 Rue Pasteur, Annaba")}
                  />
                </div>
              </div>
            </div>
            {/* Row 2: Téléphone & Email */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                  <label className={labelCls}>{t("suppliers.telephone", "Téléphone")} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newSupplier.Telephone}
                    onChange={e => setNewSupplier({ ...newSupplier, Telephone: e.target.value })}
                    className={inputCls}
                    placeholder={t("suppliers.telephonePlaceholder", "Ex: 0661 02 03 04")}
                  />
              </div>
              <div>
                <label className={labelCls}>{t("suppliers.email", "Email")} <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={newSupplier.Email}
                  onChange={e => setNewSupplier({ ...newSupplier, Email: e.target.value })}
                  className={inputCls}
                  placeholder={t("suppliers.emailPlaceholder", "Ex: fournisseur@email.com")}
                />
              </div>
            </div>
            {/* Row 2.5: Date de dépôt */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className={labelCls}>{t("suppliers.dateDepot", "Date de dépôt")} <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={newSupplier.DateDepot || ''}
                  onChange={e => setNewSupplier({ ...newSupplier, DateDepot: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            {/* Row 3: NIF && AI && RC */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelCls}> {t("suppliers.nif", "NIF")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newSupplier.Nif}
                  onChange={e => setNewSupplier({ ...newSupplier, Nif: e.target.value })}
                  className={inputCls}
                  placeholder={t("suppliers.nifPlaceholder", "Ex: 000616080698110")}
                />
              </div>
              <div>
                <label className={labelCls}> {t("suppliers.ai", "AI")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newSupplier.Ai}
                  onChange={e => setNewSupplier({ ...newSupplier, Ai: e.target.value })}
                  className={inputCls}
                  placeholder={t("suppliers.aiPlaceholder", "Ex: 12345678")}
                />
              </div>
              <div>
                <label className={labelCls}> {t("suppliers.rc", "RC")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newSupplier.Rc}
                  onChange={e =>
                    setNewSupplier({ ...newSupplier, Rc: e.target.value })
                  }
                  className={inputCls}
                  placeholder={t("suppliers.rcPlaceholder", "Ex: 16B1234567")}
                />
              </div>
            </div>
            {/* Row 4: Agence Bancaire && RIB */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}> {t("suppliers.agenceBancaire", "Agence bancaire")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newSupplier.AgenceBancaire}
                  onChange={e =>
                    setNewSupplier({
                      ...newSupplier,
                      AgenceBancaire: e.target.value
                    })
                  }
                  className={inputCls}
                  placeholder={t("suppliers.agenceBancairePlaceholder", "Ex: Banque Nationale, Annaba")}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t("suppliers.rib", "RIB")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplier.Rib}
                  onChange={e =>
                    setNewSupplier({ ...newSupplier, Rib: e.target.value })
                  }
                  className={inputCls}
                  placeholder={t("suppliers.ribPlaceholder", "Ex: 001002030400500600")}
                />
              </div>
          </div>
        </div>
    );
}
