import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import {
  insertNewEvaluationService,
  getEvaluationByOperationService,
  deleteEvaluationService
} from '../../services/Evaluation/evaluationServices';
import { Award, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Import components
import Header from '../../components/Shared/Header';
import EvaluationFormModal from '../../components/Evaluation/EvaluationForm';
import EvaluationsTable from '../../components/Evaluation/EvaluationTable';
import LoadingState from '../../components/Shared/tools/LoadingState';
import ErrorState from '../../components/Shared/ErrorState';
import { Sidebar } from '../../components/Shared/Sidebar';

const OperationEvaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  const sessionId = location.state?.sessionId;
  const sessionTime = location.state?.sessionTime;

  // State
  const [operation, setOperation] = useState(null);
  const [lots, setLots] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);

  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [scores, setScores] = useState({
    administrative: null,
    technique: '',
    financier: '',
    final: ''
  });
  const [sortBy, setSortBy] = useState('finalScore');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Use session closed status from location state if passed
  const sessionClosed = location.state?.isClosed || false;

  const hasFetchedDetails = useRef({});
  const initialFetchDone = useRef(false);

  // Handle new evaluation button click
  const handleNewEvaluation = useCallback(() => {
    // Reset form state
    setSelectedSupplier(null);
    setSelectedLot(null);
    setScores({
      administrative: null,
      technique: '',
      financier: '',
      final: ''
    });
    setShowEvaluationModal(true);
  }, []);

  // Fetch evaluations from backend
  const fetchEvaluations = useCallback(async (operationId) => {
    if (!operationId) return null;

    setEvaluationsLoading(true);
    try {
      const response = await getEvaluationByOperationService(operationId);

      if (response.success) {
        const transformedEvaluations = (response.evaluations || []).map(evaluation => ({
          id: evaluation.EvaluationID,
          supplierId: evaluation.SupplierID,
          supplierName: evaluation.Nom || '',
          lotId: evaluation.LotID,
          lotNumber: evaluation.NumeroLot,
          scores: {
            administrative: evaluation.AdminNote,
            technique: evaluation.TechnicalNote,
            financier: evaluation.FinancialNote,
            final: evaluation.FinalNote
          },
          isAdministrativelyValid: evaluation.AdminNote === 1,
          finalScore: evaluation.FinalNote,
          rejectionReason: evaluation.RejectionReason || null
        }));

        setEvaluations(transformedEvaluations);
        return response; // Return the full response including operation, lots, suppliers
      } else {
        console.error('Failed to fetch evaluations:', response.message);
        showToast(response.message || t('evaluation.fetchError'), "error");
        return null;
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      showToast(t('evaluation.fetchError'), "error");
      return null;
    } finally {
      setEvaluationsLoading(false);
    }
  }, [showToast, t]);

  // Fetch operation details
  const fetchOperationData = useCallback(async (operationId, shouldShowLoading = true) => {
    if (!operationId) return null;

    if (shouldShowLoading) setLoading(true);
    setFetchError(null);

    try {
      // Fetch everything in one go
      const result = await fetchEvaluations(operationId);

      if (result && result.success) {
        setOperation(result.operation);

        // Normalize lots to always have consistent ID property
        const normalizedLots = (result.lots || []).map(lot => ({
          ...lot,
          id: lot.Id || lot.id,
          // Keep the original ID for backward compatibility
          Id: lot.Id || lot.id
        }));
        setLots(normalizedLots);

        // Normalize suppliers similarly
        const normalizedSuppliers = (result.suppliers || []).map(supplier => ({
          ...supplier,
          id: supplier.Id || supplier.id,
          // Keep the original ID for backward compatibility
          Id: supplier.Id || supplier.id
        }));
        setSuppliers(normalizedSuppliers);

        return result.operation;
      } else {
        setFetchError(t('operations.fetchError'));
        return null;
      }
    } catch (error) {
      console.error("Error in fetchOperationData:", error);
      setFetchError(t('operations.fetchError'));
      showToast(t('operations.fetchError'), "error");
      return null;
    } finally {
      if (shouldShowLoading) setLoading(false);
    }
  }, [showToast, fetchEvaluations, t]);

  // Initial fetch - only run once
  useEffect(() => {
    if (!id || initialFetchDone.current) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      const operation = await fetchOperationData(id, false);
      if (operation) {
        hasFetchedDetails.current[id] = true;
        initialFetchDone.current = true;
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id, fetchOperationData]);

  const handleScoreChange = (field, value) => {
    if (field === "administrative" && value === 0) {
      setScores({
        administrative: 0,
        technique: '',
        financier: '',
        final: ''
      });
      return;
    }

    if (field === "administrative" && value === 1) {
      setScores(prev => ({
        ...prev,
        administrative: 1
      }));
      return;
    }

    setScores(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddEvaluation = async (extraData = {}) => {
    // Validate supplier selection
    if (!selectedSupplier) {
      showToast(t('evaluation.selectSupplierError'), "error");
      return;
    }

    // Validate lot selection if lots exist
    if (lots.length > 0 && !selectedLot) {
      showToast(t('evaluation.selectLotError'), "error");
      return;
    }

    // Validate administrative decision
    if (scores.administrative === null || scores.administrative === '') {
      showToast(t('evaluation.adminDecisionError'), "error");
      return;
    }

    // Validate scores if administratively accepted
    if (scores.administrative === 1) {
      if (scores.technique === '' || scores.financier === '' || scores.final === '') {
        showToast(t('evaluation.fillScoresError'), "error");
        return;
      }

      const technique = parseFloat(scores.technique);
      const financier = parseFloat(scores.financier);
      const final = parseFloat(scores.final);

      if (isNaN(technique) || isNaN(financier) || isNaN(final)) {
        showToast(t('evaluation.invalidScoresError'), "error");
        return;
      }
    }

    // Validate authentication
    if (!user?.userId) {
      showToast(t('evaluation.notAuthenticated'), "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const administrative = parseInt(scores.administrative);
      const isAdminValid = administrative === 1;

      const technique = isAdminValid ? parseFloat(scores.technique) : null;
      const financier = isAdminValid ? parseFloat(scores.financier) : null;
      const finalNote = isAdminValid ? parseFloat(scores.final) : null;
      const rejectionReason = administrative === 0
        ? (extraData.rejectionReason || null)
        : (extraData.observation || null);

      // Get the correct lot ID - handle both 'id' and 'Id' properties
      const lotId = selectedLot ? (selectedLot.id || selectedLot.Id) : null;

      // Get the correct supplier ID
      const supplierId = selectedSupplier.Id || selectedSupplier.id;

      const evaluationData = {
        IdSession: sessionId,
        IdOperation: operation?.Id || operation?.id,
        IdLot: lotId,
        IdSupplier: supplierId,
        ScoreAdministrative: administrative,
        ScoreTechnique: technique,
        ScoreFinancier: financier,
        FinalNote: finalNote,
        RejectionReason: rejectionReason
      };

      console.log('Sending evaluation data:', evaluationData);

      const response = await insertNewEvaluationService(evaluationData);

      if (response.success) {
        showToast(t('evaluation.addedSuccess'), "success");

        await fetchEvaluations(operation?.Id || operation?.id);

        // Reset form and close modal
        setSelectedSupplier(null);
        setSelectedLot(null);
        setScores({
          administrative: null,
          technique: '',
          financier: '',
          final: ''
        });
        setShowEvaluationModal(false);
      } else {
        if (response.isDuplicate) {
          showToast(response.message || t('evaluation.duplicateError'), "error");
        } else {
          showToast(response.message || t('evaluation.addError'), "error");
        }
      }
    } catch (error) {
      console.error("Error adding evaluation:", error);
      showToast(t('evaluation.addError'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveEvaluation = async (id) => {
    const evalToDelete = evaluations.find(e => e.id === id);

    if (!evalToDelete) {
      showToast(t('evaluation.evalNotFound'), "error");
      return;
    }

    if (!sessionId) {
      showToast(t('evaluation.sessionNotFound'), "error");
      return;
    }

    const operationId = operation?.Id || operation?.id || id;

    try {
      const payload = {
        IdSession: sessionId,
        IdOperation: operationId,
        IdLot: evalToDelete.lotId || null,
        IdSupplier: evalToDelete.supplierId
      };

      const response = await deleteEvaluationService(payload);

      if (response.success) {
        setEvaluations(prev => prev.filter(e => e.id !== id));
        showToast(t('evaluation.deletedSuccess'), "success");
      } else {
        showToast(response.message || t('evaluation.deleteError'), "error");
      }
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      showToast(t('evaluation.deleteError'), "error");
    }
  };

  const validEvaluations = useMemo(() => evaluations.filter(e => e.isAdministrativelyValid), [evaluations]);

  const statistics = useMemo(() => {
    if (validEvaluations.length === 0) {
      return {
        totalEvaluations: evaluations.length,
        validEvaluations: 0,
        rejectedEvaluations: evaluations.length,
        bestScore: 0,
        averageScore: 0
      };
    }

    const bestScore = Math.max(...validEvaluations.map(e => e.finalScore || 0));
    const averageScore = validEvaluations.reduce((acc, e) => acc + (e.finalScore || 0), 0) / validEvaluations.length;

    return {
      totalEvaluations: evaluations.length,
      validEvaluations: validEvaluations.length,
      rejectedEvaluations: evaluations.length - validEvaluations.length,
      bestScore: bestScore ? Math.round(bestScore * 10) / 10 : 0,
      averageScore: averageScore ? Math.round(averageScore * 10) / 10 : 0
    };
  }, [evaluations, validEvaluations]);

  if (loading) return <LoadingState />;
  if (fetchError) return <ErrorState message={fetchError} onBack={() => navigate(-1)} />;

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
        <div className="flex-1 flex flex-col">
          <Header
            operationNumber={operation?.Numero || id}
            sessionDateTime={sessionTime}
            serviceContractant={operation?.Service_Contractant}
            objet={operation?.Objet}
            onBack={() => navigate(-1)}
          />

          <div className="px-4 py-6">
            {/* Main Content */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('evaluation.evaluationsTitle')}</h2>
                <div className="flex gap-2">
                  {!sessionClosed && (
                    <button
                      onClick={handleNewEvaluation}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-700 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition"
                    >
                      <Award className="w-4 h-4" />
                      {t('evaluation.newEvaluation')}
                    </button>
                  )}
                  {sessionClosed && (
                    <span className="px-2 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md flex items-center gap-1.5 border border-gray-200">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {t('evaluation.sessionClosed')}
                    </span>
                  )}
                </div>
              </div>
              <EvaluationsTable
                evaluations={evaluations}
                lots={lots}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onRemoveEvaluation={handleRemoveEvaluation}
              />
            </div>
          </div>

          {/* Evaluation Form Modal */}
          <EvaluationFormModal
            isOpen={showEvaluationModal}
            onClose={() => setShowEvaluationModal(false)}
            suppliers={suppliers}
            lots={lots}
            selectedSupplier={selectedSupplier}
            selectedLot={selectedLot}
            scores={scores}
            onLotChange={setSelectedLot}
            onSupplierChange={setSelectedSupplier}
            onScoreChange={handleScoreChange}
            onSubmit={handleAddEvaluation}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </>
  );
};

export default OperationEvaluation;