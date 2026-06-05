import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { getAllSuppliers, newSupplier as newSupplierService, updateSupplier as updateSupplierService, deleteSupplierService } from '../../services/Suppliers/supplierService';
import { SuppliersTable } from './SuppliersTable';
import { FormModal } from '../Shared/FormModal';
import { UpdateSupplierForm } from "./UpdateSupplierForm";
import { useToast } from '../../hooks/useToast';
import { useTranslation } from "react-i18next";

export function SuppliersSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    NatureJuridique: "SARL",
    Nif: "",
    Rc: "",
    Adresse: "",
    Telephone: "",
    Email: "",
    AgenceBancaire: "",
    Rib: "",
    Ai: "",
    Nom: "",
    RaisonSocial: "",
    DateDepot: "",
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (user?.userId) {
        setLoading(true);
        try {
          const response = await getAllSuppliers(user.userId);
          if (response.success) {
            console.log("First supplier fields:", Object.keys(response.suppliers[0] || {}));
            setSuppliers(response.suppliers);
          }
        } catch (error) {
          console.error("Failed to fetch suppliers:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSuppliers();
  }, [user]);

  useEffect(() => {
    console.log(suppliers)
  }, [])

  const handleDeleteSupplier = async (id) => {
    try {
      const result = await deleteSupplierService(id);
      if (result.success) {
        setSuppliers(prev => prev.filter(supplier => supplier.Id !== id));
        showToast(t(result.message, t('suppliers.deletedSuccess', 'Fournisseur supprimé avec succès.')), 'success');
      } else {
        showToast(t(result.message, t('suppliers.errors.deleteBlockedByRetrait', 'Impossible de supprimer ce fournisseur car il est lié à une opération de retrait.')), 'error');
      }
    } catch (error) {
      showToast(t('operations.serverError', 'Erreur de connexion au serveur'), 'error');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchableFields = [
      supplier.Telephone,
      supplier.Email,
      supplier.Nom,
      supplier.Adresse,
    ];
    const searchableString = searchableFields
      .map(val => (val || '').toLowerCase())
      .join(' ');

    return searchableString.includes(term);
  });

  const handleModalOpen = (supplier = null) => {
    if (supplier) {
      const normalizedDateDepot = supplier.DateDepot || supplier.dateDepot
        ? new Date(supplier.DateDepot || supplier.dateDepot).toISOString().split('T')[0]
        : '';

      setEditingSupplier(supplier);
      setNewSupplier({
        ...supplier,
        RaisonSocial: supplier.RaisonSocial || supplier.raisonSocial || '',
        DateDepot: normalizedDateDepot
      });
    } else {
      setEditingSupplier(null);
      setNewSupplier({
        NatureJuridique: "SARL",
        Nif: "",
        Rc: "",
        Adresse: "",
        Telephone: "",
        Email: "",
        AgenceBancaire: "",
        Rib: "",
        Ai: "",
        Nom: "",
        RaisonSocial: "",
        DateDepot: "",
      });
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleSaveSupplier = async () => {
    try {
      if (!newSupplier.RaisonSocial) {
        showToast(t('suppliers.raisonSocialRequired', "La raison sociale est obligatoire."), 'error');
        return;
      }
      if (!newSupplier.DateDepot) {
        showToast(t('suppliers.dateDepotRequired', "La date de dépôt est obligatoire."), 'error');
        return;
      }

      if (editingSupplier) {
        const result = await updateSupplierService(newSupplier);
        if (result?.success || result?.code === 0) {
          setSuppliers(prev =>
            prev.map(s => (s.Id === newSupplier.Id ? { ...s, ...newSupplier } : s))
          );
          showToast(t('suppliers.updatedSuccess', 'Fournisseur modifié avec succès.'), 'success');
          handleModalClose();
        } else {
          showToast(result?.message || t('suppliers.updateError', 'Erreur lors de la modification.'), 'error');
        }
      } else {
        const result = await newSupplierService({ ...newSupplier, adminId: user.userId });
        if (result.success) {
          // Refetch to get the DB-generated Id and Status
          try {
            const response = await getAllSuppliers(user.userId);
            if (response.success) {
              setSuppliers(response.suppliers);
            } else {
              setSuppliers(prev => [...prev, result.supplier]); // Fallback
            }
          } catch (e) {
            setSuppliers(prev => [...prev, result.supplier]); // Fallback
          }
          showToast(t('operations.supplierAdded', 'Fournisseur ajouté avec succès.'), 'success');
          handleModalClose();
        } else {
          showToast(result?.message || t('operations.addError', "Erreur lors de l’ajout."), 'error');
        }
      }
    } catch (error) {
      showToast(t('common.toasts.serverError', 'Erreur de connexion au serveur'), 'error');
    }
  };

  if (loading) return <div className="p-8">{t('loading', 'Chargement...')}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen w-full">
      {/* Remove max-w-7xl mx-auto to allow full width */}
      <div className="w-full">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {t('suppliers.listTitle', 'Liste des Fournisseurs')}
        </h2>
        <section className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded overflow-hidden transition-colors w-full">
          <div className="border-b border-gray-300 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('suppliers.searchPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl w-full sm:w-74 text-sm focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => handleModalOpen()}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white rounded flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t('suppliers.addSupplier', 'Ajouter Fournisseur')}
            </button>
          </div>

          <div className="p-4 md:p-6 bg-white dark:bg-slate-900 overflow-x-auto">
            <SuppliersTable
              suppliers={filteredSuppliers}
              handleModalOpen={handleModalOpen}
              handleDeleteSupplier={handleDeleteSupplier}
            />
          </div>
        </section>
      </div>

      <FormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleSaveSupplier}
        title={editingSupplier ? t('suppliers.editTitle', "Modifier le fournisseur") : t('suppliers.newTitle', "Nouveau fournisseur")}
        saveText={editingSupplier ? t('suppliers.modify', "Modifier") : t('suppliers.add', "Ajouter")}
      >
        <UpdateSupplierForm newSupplier={newSupplier} setNewSupplier={setNewSupplier} />
      </FormModal>
    </div>
  );
}