// NewEngagementForm.jsx
import React, { useEffect, useState } from 'react';
import { Hash, FileText, Calendar, DollarSign, Plus, ArrowUpDown, Minus, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SearchableDropdown from '../Shared/SearchableDropdown';

export default function NewEngagementForm({
  initialData = {},
  lots = [],
  partitions = [], // Add partitions prop
  onDataChange // Add this prop to send form data to parent
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    lot: initialData.lot || null,
    partition: initialData.partition || null, // Add partition field
    reference: initialData.reference || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    amount: initialData.amount || '',
    reason: initialData.reason || '',
    visaCf: initialData.visaCf || '',
    type: initialData.type || 'DEBIT', // Add type field with default DEBIT
  });

  // Notify parent when form data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  // Check if type is CREDIT to hide lot selection
  const isCreditType = formData.type === 'CREDIT';

  return (
    <div className="space-y-2">
      {/* Type Selection - Styled like the example */}
      <div>
        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3" /> {t('budget.newEngagementForm.type')} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'DEBIT', lot: null, partition: null })}
            className={`flex-1 flex items-center justify-center gap-2 px-2 py-1 text-[10px] font-medium rounded transition-all ${formData.type === 'DEBIT'
              ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-600 ring-offset-1 dark:ring-offset-slate-900'
              : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
          >
            {t('budget.newEngagementForm.debit')}
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'CREDIT', lot: null, partition: null })}
            className={`flex-1 flex items-center justify-center gap-2 px-2 py-1 text-[10px] font-medium rounded transition-all ${formData.type === 'CREDIT'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600 ring-offset-1 dark:ring-offset-slate-900'
              : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
          >
            {t('budget.newEngagementForm.credit')}
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Lot - Only visible when type is DEBIT */}
      {!isCreditType && (
        <>
          {/* Partition Selection */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3" /> {t('budget.newEngagementForm.partition') || 'Partition'} <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              options={partitions}
              value={formData.partition}
              onChange={(partition) => setFormData({ ...formData, partition })}
              placeholder={partitions.length === 0 ? t('budget.newEngagementForm.loadingPartitions') || 'Loading partitions...' : t('budget.newEngagementForm.partitionPlaceholder') || 'Select partition...'}
              renderOption={(partition) => `${partition.TravauxTypeLabel || partition.TravauxType}: ${partition.Description || ''}`}
              filterFn={(partition, term) =>
                (partition.TravauxType?.toString() || '').toLowerCase().includes(term.toLowerCase()) ||
                (partition.TravauxTypeLabel || '').toLowerCase().includes(term.toLowerCase()) ||
                (partition.Description || '').toLowerCase().includes(term.toLowerCase())
              }
            />
          </div>

          {/* Lot Selection */}
          {lots && lots.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
                <Hash className="w-3 h-3" /> {t('budget.newEngagementForm.lot')} <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={lots}
                value={formData.lot}
                onChange={(lot) => setFormData({ ...formData, lot })}
                placeholder={lots.length === 0 ? t('budget.newEngagementForm.loadingLots') : t('budget.newEngagementForm.lotPlaceholder')}
                renderOption={(lot) => `Lot ${lot.NumeroLot}: ${lot.Designation || ''}`}
                filterFn={(lot, term) =>
                  (lot.NumeroLot?.toString() || '').toLowerCase().includes(term.toLowerCase()) ||
                  (lot.Designation || '').toLowerCase().includes(term.toLowerCase())
                }
              />

            </div>
          )}
        </>
      )}
      {/* Info message when CREDIT is selected */}
      {isCreditType && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-2">
          <p className="text-[10px] text-blue-700 dark:text-blue-300">
            {t('budget.newEngagementForm.creditInfo')}
          </p>
        </div>
      )}

      {/* Reference */}
      <div>
        <div className='grid grid-cols-1 gap-3'>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
              <FileText className="w-3 h-3" /> {t('budget.newEngagementForm.reference')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1 rounded bg-white dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-slate-500 outline-none transition-colors"
              placeholder={t('budget.newEngagementForm.referencePlaceholder')}
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Date */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {t('budget.newEngagementForm.date')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1 rounded bg-white dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-slate-500 outline-none transition-colors"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> {t('budget.newEngagementForm.amount')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1 rounded bg-white dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-slate-500 outline-none transition-colors"
            placeholder={t('budget.newEngagementForm.amountPlaceholder')}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
          <FileText className="w-3 h-3" /> {t('budget.newEngagementForm.reason')}
        </label>
        <textarea
          className="w-full border border-gray-300 dark:border-slate-700 px-2 py-1 rounded bg-white dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-slate-500 outline-none transition-colors min-h-[60px]"
          placeholder={t('budget.newEngagementForm.reasonPlaceholder')}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        />
      </div>
    </div>
  );
}