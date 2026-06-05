import React from 'react';

export function RetraitModal({
  isOpen,
  numeroRetrait,
  setNumeroRetrait,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded border w-full max-w-md">

        <div className="border-b px-4 py-3 font-semibold">
          Saisie du numéro de retrait
        </div>

        <div className="p-4">
          <label className="block text-sm mb-1">
            Numéro de retrait <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={numeroRetrait}
            onChange={(e) => setNumeroRetrait(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Ex: RT-2025-001"
          />
        </div>

        <div className="flex justify-end gap-3 px-4 py-3 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-slate-700 text-white rounded"
          >
            Confirmer
          </button>
        </div>

      </div>
    </div>
  );
}
