import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOperationForBudgetManagementService } from '../../services/Operations/operationService';
import { BudgetOperationsTable } from './BudgetOperationsTable';

const normalizeOperation = (op) => ({
  id: op.Id,
  operationNumber: op.Numero || '',
  operationService: op.Service_Contractant || '',
  operationObject: op.Objet || '',
  operationProgram: op.Program || op.Programme || '',
  operationAP: op.AP || ''
});

export function BudgetOperationsSection() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState([]);

  const fetchOperations = useCallback(async () => {
    const adminID = user?.userId || user?.userid;
    if (!adminID) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getOperationForBudgetManagementService(adminID);

      if (response.success && response.data) {
        setOperations(response.data.map(normalizeOperation));
      } else {
        console.error("Failed to fetch operations:", response.message);
        setOperations([]);
      }
    } catch (error) {
      console.error("Error fetching budget operations:", error);
      setOperations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  const sortedOperations = useMemo(
    () => [...operations].sort((a, b) => String(a.operationNumber).localeCompare(String(b.operationNumber))),
    [operations]
  );

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 md:p-6 transition-colors">
      <section className="h-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {t('budget.sectionTitle')}
          </h2>
        </div>
        {loading ? (
          <div className="py-8 text-xs text-center text-gray-500 dark:text-slate-400">{t('budget.loadingOperations')}</div>
        ) : (
          <BudgetOperationsTable operations={sortedOperations} onRefresh={fetchOperations} />
        )}
      </section>
    </div>
  );
}
