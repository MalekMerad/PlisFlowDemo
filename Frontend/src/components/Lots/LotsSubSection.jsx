import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addNewLotService, updateLotService, deleteLotService } from '../../services/Lots/lotService';
import { LotsTable } from './LotsTable';
import { useToast } from '../../hooks/useToast';
import { SectionsModal } from '../Shared/SectionsModal';
import LotForm from './LotForm';
import { useTranslation } from 'react-i18next';

export function LotsSubSection({ operationID, Lots, refreshData, showButton, readOnly = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);

  // Run this when the Component is rendered
  useEffect(() => {
    if (Lots) {
      setLoading(false);
    }
  }, [Lots]);

  const [newLot, setNewLot] = useState({
    numero: '',
    designation: '',
    operationId: operationID,
  });

  // Reset form when operationID changes
  useEffect(() => {
    setNewLot(prev => ({
      ...prev,
      operationId: operationID,
    }));
  }, [operationID]);

  const handleOpenModal = (lot = null) => {
    // console.log("Opening modal, lot parameter:", lot);

    if (lot) {
      // Editing an existing lot
      setEditingLot(lot);
      setNewLot({
        numero: lot.NumeroLot || '',
        designation: lot.Designation || '',
        operationId: operationID,
      });
      // console.log("Setting modal for EDITING lot:", lot.NumeroLot);
    } else {
      // Adding a new lot
      setEditingLot(null);
      setNewLot({
        numero: '',
        designation: '',
        operationId: operationID,
      });
      // console.log("Setting modal for ADDING new lot");
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    // console.log("Closing modal");
    setShowModal(false);

    // Clear state after a short delay to ensure modal closes first
    setTimeout(() => {
      setEditingLot(null);
      setNewLot({
        numero: '',
        designation: '',
        operationId: operationID,
      });
    }, 100);
  };

  const handleEditLot = async () => {
    try {
      // console.log("Editing lot ID:", editingLot.id, "with designation:", newLot.designation);
      const result = await updateLotService(editingLot.Id || editingLot.id, newLot.designation);

      if (result.success) {
        handleModalClose();
        showToast(t('lot.editSuccess', 'Lot modifié avec succès.'), 'success');
        refreshData(); // Refresh parent data
      } else {
        showToast(t('lot.editError', 'Impossible de modifier le lot.'), 'error');
      }
    } catch (error) {
      showToast(t('lot.editCatchError', 'Erreur lors de la modification du lot.'), 'error');
    }
  };

  const handleAddLot = async () => {
    try {
      const lotData = {
        NumeroLot: newLot.numero,
        Designation: newLot.designation,
        id_Operation: operationID,
        adminId: user?.userId || user?.userid
      };

      // console.log("Adding new lot:", lotData);
      const result = await addNewLotService(lotData);

      if (result.success) {
        handleModalClose();
        showToast(t('lot.addSuccess', 'Lot ajouté avec succès.'), 'success');
        refreshData();
      } else {
        showToast(t('lot.addError', "Impossible d'ajouter le lot."), 'error');
      }
    } catch (error) {
      // console.error("Error adding new lot:", error);
      showToast(t('lot.addCatchError', "Erreur lors de l'ajout du lot."), 'error');
    }
  };

  const handleSaveLot = async () => {
    // console.log("Saving lot, editingLot:", editingLot);

    // Validation: Ensure required fields are present
    if (!newLot.designation.trim()) {
      showToast(t('lot.designationRequired', 'La désignation est obligatoire.'), 'error');
      return;
    }

    if (editingLot) {
      // console.log("Initiating Edit for ID:", editingLot.id);
      await handleEditLot();
    } else {
      if (!newLot.numero.trim()) {
        showToast(t('lot.numberRequired', 'Le numéro est obligatoire pour un nouveau lot.'), 'error');
        return;
      }
      await handleAddLot();
    }
  };

  const handleDeleteLot = async (id) => {
    try {
      // console.log("Deleting lot ID:", id);
      const result = await deleteLotService(id);

      if (result.success) {
        showToast(t('lot.deleteSuccess', 'Lot supprimé avec succès.'), 'success');
        refreshData(); // Refresh parent data
      } else {
        showToast(t('lot.deleteError', 'Impossible de supprimer le lot.'), 'error');
      }
    } catch (error) {
      showToast(t('lot.deleteCatchError', 'Erreur lors de la suppression du lot.'), 'error');
    }
  };

  if (loading) {
    return <div>{t('loading', 'Chargement des Lots ...')}</div>;
  }

  return (
    <>
      <SectionsModal
        title={t('lot.title', 'Lots')}
        icon={<Package className="w-4 h-4" />}
        buttonText={t('lot.newLotButton', 'Ajouter Lot')}
        showSearch={false}
        showFilter={false}
        onButtonClick={() => handleOpenModal()}
        showButton={showButton}
      >
        <LotsTable
          Lots={Lots}
          handleOpenModal={handleOpenModal}
          handleDeleteLot={handleDeleteLot}
          readOnly={readOnly}
        />
      </SectionsModal>

      <LotForm
        showModal={showModal}
        handleModalClose={handleModalClose}
        handleSaveLot={handleSaveLot}
        editingLot={editingLot}
        newLot={newLot}
        setNewLot={setNewLot}
      />
    </>
  );
}

