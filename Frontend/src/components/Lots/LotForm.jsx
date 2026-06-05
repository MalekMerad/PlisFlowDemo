import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '../Shared/FormModal';

const LotForm = ({ showModal, handleModalClose, handleSaveLot, editingLot, newLot, setNewLot }) => {
  const { t } = useTranslation();

  return (
    <div>
      <FormModal
        key={editingLot ? `edit-${editingLot.id}` : 'add-new'}
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleSaveLot}
        title={editingLot ? t('lot.editLotTitle', 'Modifier le lot') : t('lot.newLotTitle', 'Nouveau Lot')}
        saveText={editingLot ? t('edit', 'Modifier') : t('add', 'Ajouter')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
              {t('lot.number', 'Numéro')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newLot.numero}
              onChange={e => setNewLot({ ...newLot, numero: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder={t('lot.numberPlaceholder', 'LOT-XX')}
              readOnly={!!editingLot}
              disabled={!!editingLot}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
              {t('lot.designation', 'Désignation')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newLot.designation}
              onChange={e => setNewLot({ ...newLot, designation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder={t('lot.designationPlaceholder', 'Description du lot')}
              rows={4}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default LotForm;
