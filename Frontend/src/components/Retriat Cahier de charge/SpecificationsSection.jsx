import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { FileText } from 'lucide-react';
import { deleteRetrait, createRetrait } from '../../services/Retrait Cahier de charge/retraitService';
import { SpecificationsTable } from './SpecificationsTable';
import { useToast } from '../../hooks/useToast';
import { SectionsModal } from "../Shared/SectionsModal";
import { SupplierModals } from '../Suppliers/SupplierModals';
import { RetraitModal } from './RetraitModal';
import { getAllSuppliers, addSelectedSupplier } from '../../services/Suppliers/supplierService';
import { useTranslation } from 'react-i18next';

export function SpecificationsSection({ operationID, Specifications, refreshData, showButton, canDelete, announce }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // UI States
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Supplier Selection Modal
  const [showRetraitModal, setShowRetraitModal] = useState(false); // Number Input Modal

  // Data States
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [numeroRetrait, setNumeroRetrait] = useState("");

  // New Supplier Form State
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    Nom: "",
    RaisonSocial: "",
    Telephone: "",
    Email: "",
    Adresse: "",
    DateDepot: "",
  });


  useEffect(() => {
    async function fetchSuppliers() {
      setLoading(true);
      try {
        const data = await getAllSuppliers(user?.userId);
        if (data && data.success && Array.isArray(data.suppliers)) {
          setSuppliers(data.suppliers);
        } else {
          setSuppliers([]);
        }
      } catch (err) {
        showToast(t('specificationsSection.suppliersLoadError', 'Erreur lors du chargement des fournisseurs'), 'error');
      }
      setLoading(false);
    }
    fetchSuppliers();
  }, [showModal, showNewSupplierModal, user?.userId]);

  const handleDeleteRetrait = async (supplierId) => {
    try {
      const response = await deleteRetrait(supplierId, operationID);
      if (response.success) {
        showToast(response.message || t('specificationsSection.retraitDeleteSuccess', 'Retrait supprimé avec succès'), 'success');
        refreshData();
      } else {
        if (response.code === 1002) {
          showToast(t('specificationsSection.noRetraitFound', 'Aucun retrait trouvé pour cette opération et fournisseur'), 'warning');
        } else {
          showToast(response.message || t('specificationsSection.deleteError', 'Erreur lors de la suppression'), 'error');
        }
      }
    } catch (error) {
      console.error('Error in handleDeleteRetrait:', error);
      showToast(t('specificationsSection.serverError', 'Erreur de connexion au serveur'), 'error');
    }
  };

  const handleAssignSupplier = (supplierId) => {
    setSelectedSupplierId(supplierId);
    setShowModal(false); // Close selection list
    setShowRetraitModal(true); // Open number input
  };

  const handleConfirmRetrait = async () => {
    if (!numeroRetrait.trim()) {
      showToast(t('specificationsSection.numeroRequired', "Le numéro de retrait est obligatoire"), "warning");
      return;
    }

    try {
      const payload = {
        SupplierID: selectedSupplierId,
        OperationID: operationID,
        NumeroRetrait: numeroRetrait,
        adminId: user?.userId,
        AnnonceID: announce?.Id || announce?.id,
      };

      const response = await createRetrait(payload);

      if (response.success) {
        showToast(response.message || t('specificationsSection.retraitSuccess', 'Retrait assigné avec succès'), 'success');
        resetRetraitFlow();
        refreshData(); // Refresh main operation data
      } else {
        showToast(response.message || t('specificationsSection.retraitError', 'Erreur lors de l\'assignation du retrait'), 'error');
      }
    } catch (error) {
      showToast(t('specificationsSection.assignationError', "Une erreur est survenue lors de l'assignation"), "error");
    }
  };

  const resetRetraitFlow = () => {
    setShowRetraitModal(false);
    setSelectedSupplierId(null);
    setNumeroRetrait("");
  };

  const handleAddNewSupplier = async () => {
    if (!newSupplier.RaisonSocial) {
      showToast(t('specificationsSection.raisonSocialRequired', "La raison sociale est obligatoire"), "error");
      return;
    }
    if (!newSupplier.DateDepot) {
      showToast(t('specificationsSection.dateDepotRequired', "La date de dépôt est obligatoire"), "error");
      return;
    }
    try {
      const response = await addSelectedSupplier({
        ...newSupplier,
        adminId: user?.userId,
      });

      if (response && response.success === true) {
        showToast(t('specificationsSection.supplierAddedSuccess', 'Nouveau fournisseur ajouté avec succès'), 'success');

        // Get the new supplier ID from response
        let newSupplierId = response.data?.Id || response.data?.id || response.Id || response.id || response.supplier?.Id || response.supplier?.id;

        // If ID not in response, refresh suppliers list and find the new supplier by name/email
        if (!newSupplierId) {
          const data = await getAllSuppliers(user?.userId);
          if (data && data.success && Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers);
            // Find the newly added supplier by matching name and email
            const foundSupplier = data.suppliers.find(
              s => s.Nom === newSupplier.Nom && s.Email === newSupplier.Email
            );
            if (foundSupplier) {
              newSupplierId = foundSupplier.Id || foundSupplier.id;
            }
          }
        }

        if (newSupplierId) {
          // Automatically assign the new supplier and open retrait modal
          setSelectedSupplierId(newSupplierId);
          setShowNewSupplierModal(false);
          setShowModal(false); // Close selection modal
          setNewSupplier({ Nom: "", RaisonSocial: "", Telephone: "", Email: "", Adresse: "", DateDepot: "" });
          setShowRetraitModal(true); // Open retrait modal
        } else {
          setShowNewSupplierModal(false);
          setNewSupplier({ Nom: "", RaisonSocial: "", Telephone: "", Email: "", Adresse: "", DateDepot: "" });
          showToast(t('specificationsSection.supplierAddedManualSelection', "Fournisseur ajouté, veuillez le sélectionner manuellement"), "info");
        }
      } else {
        showToast(t('specificationsSection.supplierAddError', "Erreur lors de l'ajout du fournisseur"), "error");
      }
    } catch (error) {
      showToast(t('specificationsSection.unexpectedError', "Une erreur inattendue est survenue"), "error");
    }
  };

  if (loading && suppliers.length === 0) {
    return <div className="p-8 text-center text-gray-500 dark:text-slate-400 italic font-medium">{t('specificationsSection.loading', "Chargement des données...")}</div>;
  }

  return (
    <>
      <SectionsModal
        title={t('specificationsSection.sectionTitle', "Retrait des Cahiers de Charges")}
        icon={<FileText className="w-4 h-4" />}
        buttonText={t('specificationsSection.newRetraitButton', "Nouveau Retrait")}
        showSearch={false}
        showFilter={false}
        onButtonClick={() => setShowModal(true)}
        showButton={showButton}
      >
        <SpecificationsTable
          specifications={Specifications || []}
          handleDeleteRetrait={handleDeleteRetrait}
          operationID={operationID}
          canDelete={canDelete}
        />
      </SectionsModal>

      <SupplierModals
        showSupplierModal={showModal}
        setShowSupplierModal={setShowModal}
        suppliers={suppliers}
        handleAssignSupplier={handleAssignSupplier}
        showNewSupplierModal={showNewSupplierModal}
        setShowNewSupplierModal={setShowNewSupplierModal}
        newSupplier={newSupplier}
        setNewSupplier={setNewSupplier}
        handleAddNewSupplier={handleAddNewSupplier}
        announce={announce}
        Specifications={Specifications}
      />

      <RetraitModal
        isOpen={showRetraitModal}
        numeroRetrait={numeroRetrait}
        setNumeroRetrait={setNumeroRetrait}
        onConfirm={handleConfirmRetrait}
        onCancel={resetRetraitFlow}
      />
    </>
  );
}
