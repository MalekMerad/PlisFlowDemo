import React, { useMemo, useState } from 'react';
import { Award, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../components/Shared/EmptyState';

const EvaluationsTable = ({
  evaluations,
  lots,
  sortBy,
  onSortChange,
  onRemoveEvaluation,
}) => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('accepted'); // 'accepted' | 'rejected'
  const [expandedLots, setExpandedLots] = useState(() => {
    // Initialize all lots as expanded by default
    const initialState = {};
    lots.forEach(lot => {
      initialState[lot.id] = true;
    });
    return initialState;
  });

  // Determine if we should group by lot
  const hasMultipleLots = lots.length > 1;
  const hasNoLots = lots.length === 0;

  // Group evaluations by lot
  const evaluationsByLot = useMemo(() => {
    if (!hasMultipleLots) return null;

    const grouped = {};

    // Initialize groups for each lot
    lots.forEach(lot => {
      grouped[lot.id] = {
        lotId: lot.id,
        lotNumber: lot.NumeroLot || lot.numeroLot,
        lotDesignation: lot.Designation || lot.designation,
        evaluations: []
      };
    });

    // Add evaluations to their respective lots
    evaluations.forEach(evaluation => {
      const lotId = evaluation.lotId;
      if (lotId && grouped[lotId]) {
        grouped[lotId].evaluations.push(evaluation);
      } else if (!lotId && hasNoLots) {
        // For operations with no lots, create a single group
        if (!grouped['no-lot']) {
          grouped['no-lot'] = {
            lotId: null,
            lotNumber: null,
            lotDesignation: null,
            evaluations: []
          };
        }
        grouped['no-lot'].evaluations.push(evaluation);
      }
    });

    return grouped;
  }, [evaluations, lots, hasMultipleLots, hasNoLots]);

  // Sort and filter evaluations within each lot
  const processedGroups = useMemo(() => {
    const isAccepted = (e) =>
      e.isAdministrativelyValid === true ||
      e.scores?.administrative === 1;

    if (hasMultipleLots && evaluationsByLot) {
      // Process each lot group separately
      const processed = {};
      Object.keys(evaluationsByLot).forEach(lotId => {
        const group = evaluationsByLot[lotId];

        // Filter evaluations based on status
        let filteredEvaluations = group.evaluations;
        if (filterStatus === 'accepted') {
          filteredEvaluations = group.evaluations.filter(e => isAccepted(e));
        } else if (filterStatus === 'rejected') {
          filteredEvaluations = group.evaluations.filter(e => !isAccepted(e));
        }

        // Sort evaluations within the lot
        const sortedEvaluations = getSortedEvaluations(filteredEvaluations, sortBy);

        processed[lotId] = {
          ...group,
          evaluations: sortedEvaluations
        };
      });
      return processed;
    } else {
      // No lots - single group
      let filteredEvaluations = evaluations;
      const isAccepted = (e) =>
        e.isAdministrativelyValid === true ||
        e.scores?.administrative === 1;

      if (filterStatus === 'accepted') {
        filteredEvaluations = evaluations.filter(e => isAccepted(e));
      } else if (filterStatus === 'rejected') {
        filteredEvaluations = evaluations.filter(e => !isAccepted(e));
      }

      const sortedEvaluations = getSortedEvaluations(filteredEvaluations, sortBy);

      return {
        'single-group': {
          lotId: null,
          lotNumber: null,
          lotDesignation: null,
          evaluations: sortedEvaluations
        }
      };
    }
  }, [evaluations, evaluationsByLot, filterStatus, sortBy, hasMultipleLots]);

  const toggleLot = (lotId) => {
    setExpandedLots(prev => ({
      ...prev,
      [lotId]: !prev[lotId]
    }));
  };

  // Check if there are any evaluations to display
  const hasAnyEvaluations = Object.values(processedGroups).some(
    group => group.evaluations.length > 0
  );

  if (!hasAnyEvaluations) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
        <div className="bg-slate-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-2.5 flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4" />
            {t('evaluationTable.storedEvaluations', 'Évaluations enregistrées')}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">{t('evaluationTable.show', 'Afficher:')}</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="accepted">{t('evaluationTable.accepted', 'Acceptées')}</option>
                <option value="rejected">{t('evaluationTable.rejected', 'Rejetées')}</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">{t('evaluationTable.sortBy', 'Trier par:')}</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="text-xs border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="finalScore">{t('evaluationTable.finalScore', 'Score final')}</option>
                <option value="supplier">{t('evaluationTable.supplier', 'Fournisseur')}</option>
              </select>
            </div>
          </div>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
      <div className="bg-slate-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-2.5 flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Award className="w-4 h-4" />
          {t('evaluationTable.storedEvaluations', 'Évaluations enregistrées')}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">{t('evaluationTable.show', 'Afficher:')}</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="accepted">{t('evaluationTable.accepted', 'Acceptées')}</option>
              <option value="rejected">{t('evaluationTable.rejected', 'Rejetées')}</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">{t('evaluationTable.sortBy', 'Trier par:')}</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="finalScore">{t('evaluationTable.finalScore', 'Score final')}</option>
              <option value="supplier">{t('evaluationTable.supplier', 'Fournisseur')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex justify-center">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.rank', 'Rang')}</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.supplier', 'Fournisseur')}</th>
                {hasMultipleLots && (
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.lot', 'Lot')}</th>
                )}
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.admin', 'Admin.')}</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.tech', 'Tech.')}</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.financial', 'Fin.')}</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">
                  {filterStatus === 'rejected' ? t('evaluationTable.rejectionReason', 'Raison de rejet') : t('evaluationTable.finalScore', 'Score Final')}
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-slate-400">{t('evaluationTable.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
              {Object.entries(processedGroups).map(([lotId, group]) => {
                const isExpanded = expandedLots[lotId] !== false; // Default to expanded (true)
                const hasGroupHeader = hasMultipleLots && group.lotNumber;

                return (
                  <React.Fragment key={lotId}>
                    {hasGroupHeader && (
                      <tr className="bg-gray-100 dark:bg-slate-800/80 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700/80 transition" onClick={() => toggleLot(lotId)}>
                        <td colSpan={hasMultipleLots ? 8 : 7} className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {t('evaluationTable.lot', 'Lot')} {group.lotNumber}
                            </span>
                            {group.lotDesignation && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                - {group.lotDesignation}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                              ({group.evaluations.length} {t('evaluationTable.evaluations', 'évaluations')})
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {(!hasGroupHeader || isExpanded) && group.evaluations.map((evalItem, index) => (
                      <TableRow
                        key={evalItem.id}
                        evalItem={evalItem}
                        index={index}
                        showLotColumn={hasMultipleLots}
                        onRemove={onRemoveEvaluation}
                        statusFilter={filterStatus}
                        t={t}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TableRow = ({ evalItem, index, showLotColumn, onRemove, statusFilter, t }) => (
  <tr className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${index === 0 && !showLotColumn ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
    <td className="px-4 py-2 text-center">
      <RankBadge index={index} />
    </td>
    <td className="px-4 py-2 text-center">
      <div className="text-xs font-medium text-gray-900 dark:text-slate-100">{evalItem.supplierName}</div>
    </td>
    {showLotColumn && (
      <td className="px-4 py-2 text-center">
        <span className="text-xs text-gray-600 dark:text-slate-400">{evalItem.lotNumber || '-'}</span>
      </td>
    )}
    <td className="px-4 py-2 text-center">
      <AdminBadge isValid={evalItem.scores.administrative === 1} t={t} />
    </td>
    <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-slate-100">
      {evalItem.scores.technique || '-'}
    </td>
    <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-slate-100">
      {evalItem.scores.financier || '-'}
    </td>
    <td className="px-4 py-2 text-center">
      {statusFilter === 'rejected' ? (
        <span className="text-xs text-gray-700 dark:text-slate-300 italic">
          {evalItem.rejectionReason || '-'}
        </span>
      ) : (
        <ScoreBadge score={evalItem.finalScore} />
      )}
    </td>
    <td className="px-4 py-2 text-center">
      <button
        onClick={() => onRemove(evalItem.id)}
        className="text-xs text-red-600 cursor-pointer hover:text-red-800 hover:underline"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </td>
  </tr>
);

const RankBadge = ({ index }) => {
  const colors = [
    'bg-yellow-400 text-yellow-950 shadow-sm',
    'bg-gray-300 dark:bg-slate-500 text-gray-800 dark:text-slate-100',
    'bg-amber-600 text-amber-50',
    'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
  ];

  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${colors[index] || colors[3]}`}>
      {index + 1}
    </span>
  );
};

const AdminBadge = ({ isValid, t }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isValid ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
    }`}>
    {isValid ? t('evaluationTable.valid', 'Valide') : t('evaluationTable.rejectedShort', 'Rejeté')}
  </span>
);

const ScoreBadge = ({ score }) => {
  const colors = score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' :
    score >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
      score >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800';

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors}`}>
      {score}
    </span>
  );
};

const getSortedEvaluations = (evaluations, sortBy) => {
  const sorted = [...evaluations];

  switch (sortBy) {
    case 'finalScore':
      return sorted.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    case 'supplier':
      return sorted.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    default:
      return sorted;
  }
};

export default EvaluationsTable;