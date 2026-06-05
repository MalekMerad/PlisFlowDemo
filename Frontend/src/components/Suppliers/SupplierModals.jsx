import { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NewSupplierForm } from './NewSupplierForm';
import { SupplierListTable } from './SelectingSupplierTable';
import { FormModal } from '../Shared/FormModal';

export function SupplierModals({
  showSupplierModal,
  setShowSupplierModal,
  suppliers,
  handleAssignSupplier,
  showNewSupplierModal,
  setShowNewSupplierModal,
  newSupplier,
  setNewSupplier,
  handleAddNewSupplier,
  announce,
  Specifications,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Filtering Logic remains in the parent
  const safeLower = val => (typeof val === 'string' ? val.toLowerCase() : '');

  const filteredSuppliers = (suppliers || []).filter(supplier =>
    safeLower(supplier?.Nom).includes(safeLower(searchTerm)) ||
    safeLower(supplier?.Telephone).includes(safeLower(searchTerm)) ||
    safeLower(supplier?.Email).includes(safeLower(searchTerm)) ||
    safeLower(supplier?.Adresse).includes(safeLower(searchTerm))
  );

  return (
    <>
      {/* Supplier Selection Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform animate-modal-fade-up">

            {/* Header */}
            <div className="border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {t('suppliers.listTitle', 'Sélectionner un fournisseur')}
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Search and Add Actions Container */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder={t('suppliers.searchPlaceholder', 'Rechercher par nom, tel, email...')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowSupplierModal(false);
                    setShowNewSupplierModal(true);
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white rounded flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {t('suppliers.addSupplier', 'Ajouter Nouveau Fournisseur')}
                </button>
              </div>

              {/* Table Component */}
              <SupplierListTable
                filteredSuppliers={filteredSuppliers}
                handleAssignSupplier={handleAssignSupplier}
                specifications={Specifications}
                annonceId={announce?.Id || announce?.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showNewSupplierModal && (
        <FormModal
          isOpen={showNewSupplierModal}
          onSave={handleAddNewSupplier}
          title={t('suppliers.newTitle', 'Nouveau fournisseur')}
          saveText={t('suppliers.add', 'Ajouter')}
          onClose={() => {
            setShowNewSupplierModal(false);
            setShowSupplierModal(true);
            setNewSupplier({
              Nom: "",
              RaisonSocial: "",
              Telephone: "",
              Email: "",
              Adresse: "",
              DateDepot: "",
            });
          }}
        >
          <NewSupplierForm
            newSupplier={newSupplier}
            setNewSupplier={setNewSupplier}
          />
        </FormModal>
      )}
    </>
  );
}