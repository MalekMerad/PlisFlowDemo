import { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { NewSupplierForm } from '../modals/NewSupplierForm';
import { SupplierListTable } from '../tables/SelectingSupplierTable';

export function SupplierModals({
  showSupplierModal,
  setShowSupplierModal,
  suppliers,
  selectedOperationForSupplier,
  handleAssignSupplier,
  showNewSupplierModal,
  setShowNewSupplierModal,
  newSupplier,
  setNewSupplier,
  handleAddNewSupplier,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic remains in the parent
  const safeLower = val => (typeof val === 'string' ? val.toLowerCase() : '');
  
  const filteredSuppliers = (suppliers || []).filter(supplier =>
    safeLower(supplier?.NomPrenom).includes(safeLower(searchTerm)) ||
    safeLower(supplier?.Telephone).includes(safeLower(searchTerm)) ||
    safeLower(supplier?.Email).includes(safeLower(searchTerm)) ||
    safeLower(supplier?.Adresse).includes(safeLower(searchTerm))
  );

  return (
    <>
      {/* Supplier Selection Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-white/120 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded border-2 border-gray-400 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="border-b border-gray-300 bg-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Sélectionner un fournisseur</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Search and Add Actions Container */}
              <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded border border-gray-200">
                <button
                  onClick={() => setShowNewSupplierModal(true)}
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter Nouveau Fournisseur
                </button>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, tel, email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded w-80 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Table Component */}
              <SupplierListTable 
                filteredSuppliers={filteredSuppliers}
                selectedOperationForSupplier={selectedOperationForSupplier}
                handleAssignSupplier={handleAssignSupplier}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 bg-white/120 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded border-2 border-gray-400 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-300 bg-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Nouveau fournisseur</h3>
              <button onClick={() => setShowNewSupplierModal(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <NewSupplierForm
                newSupplier={newSupplier}
                setNewSupplier={setNewSupplier}
              />

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowNewSupplierModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddNewSupplier}
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}