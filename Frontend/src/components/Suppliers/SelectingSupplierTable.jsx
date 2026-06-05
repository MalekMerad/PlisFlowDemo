import { useTranslation } from 'react-i18next';

export function SupplierListTable({
  filteredSuppliers,
  specifications,
  handleAssignSupplier,
  annonceId
}) {
  const { t } = useTranslation();

  return (
    <div className={`w-full ${filteredSuppliers.length > 6 ? "max-h-44 overflow-y-auto" : ""}`}
      style={{ minWidth: '100%', scrollbarWidth: 'thin' }}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700">
            <th className="px-3 py-2 text-center font-bold uppercase tracking-wider text-[10px]">{t('suppliers.nomOrRaisonSociale', 'Nom ou Raison Sociale')}</th>
            <th className="px-3 py-2 text-center font-bold uppercase tracking-wider text-[10px]">{t('suppliers.telephone', 'Téléphone')}</th>
            <th className="px-3 py-2 text-center font-bold uppercase tracking-wider text-[10px]">{t('suppliers.email', 'Email')}</th>
            <th className="px-3 py-2 text-center font-bold uppercase tracking-wider text-[10px]">{t('suppliers.adresse', 'Adresse')}</th>
            <th className="px-3 py-2 text-center font-bold uppercase tracking-wider text-[10px]">{t('suppliers.actions', 'Action')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6} className="px-0 py-0">
              <hr className="border-t border-gray-300 dark:border-slate-700 my-0" />
            </td>
          </tr>
        </tbody>
        <tbody>
          {filteredSuppliers.map((supplier) => {
            const assignedAnnounces = supplier.AnnonceIdRetrait
              ? supplier.AnnonceIdRetrait.split(',')
              : [];

            const alreadyAssigned = specifications?.some(
              (spec) =>
                (spec.SupplierID === supplier.Id || spec.SupplierID === supplier.id) &&
                (spec.AnnonceID === annonceId)
            );
            return (
              <tr key={supplier.Id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 text-xs text-center border-b border-gray-100 dark:border-slate-800 transition-colors">
                <td className="px-2 py-1 text-gray-900 dark:text-slate-300">{supplier.Nom}</td>
                <td className="px-2 py-1 text-gray-900 dark:text-slate-300">{supplier.Telephone}</td>
                <td className="px-2 py-1 text-gray-900 dark:text-slate-300">{supplier.Email}</td>
                <td className="px-2 py-1 text-gray-900 dark:text-slate-300">{supplier.Adresse}</td>
                <td className="px-2 py-1">
                  {alreadyAssigned ? (
                    <span className="text-xs text-green-600 font-medium italic">
                      {t('specificationsSection.supplierAlreadyAssigned', 'Déjà assigné')}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssignSupplier(supplier.Id)}
                      className="px-2 py-1 text-slate-500 dark:text-slate-300 rounded text-xs transition-colors cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      {t('common.select', 'Sélectionner')}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {filteredSuppliers.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-slate-400 text-xs">
                {t('suppliers.noSuppliersFound', 'Aucun fournisseur trouvé.')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
