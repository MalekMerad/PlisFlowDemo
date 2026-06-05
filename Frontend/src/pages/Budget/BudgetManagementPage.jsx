// BudgetManagementPage.jsx - Updated version
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  HandCoins,
  ClipboardCheck,
  CalendarDays,
  FileBadge,
  CircleDollarSign,
  ReceiptText,
  Hash,
  Layers, // Add Layers icon
} from 'lucide-react';
import { Sidebar } from '../../components/Shared/Sidebar';
import { BudgetStatCards } from '../../components/Budget/BudgetStatCards';
import { BudgetDataTable } from '../../components/Budget/BudgetDataTable';
import NewEngagementForm from '../../components/Budget/NewEngagementForm';
import BudgetAlerts from '../../components/Budget/BudgetAlerts';
import ValidateEngagementModal from '../../components/Budget/ValidateEngagementModal';
import PaymentDateModal from '../../components/Budget/PaymentDateModal';
import { FormModal } from '../../components/Shared/FormModal';
import { getOperationByIdService } from '../../services/Operations/operationService';
import { useAuth } from '../../context/AuthContext';
import { formatDZD } from '../../utils/CurrencyFormat';
import { selectEngagementsAndPaymentByOperation, insertEngagement, validateEngagement } from '../../services/Budget/BudgetService';
import { updatePayment } from '../../services/Budget/PaymentService';
import { formatDate } from '../../utils/TimeDateFormat';
import { pdf } from '@react-pdf/renderer';
import EngagementReactPDFDocument from '../../components/Budget/EngagementReactPDFDocument';
import PaymentReactPDFDocument from '../../components/Budget/PaymentReactPDFDocument';
import { useToast } from '../../hooks/useToast';
import { getTopSupplierService } from '../../services/Suppliers/supplierService';
import { getPartitonsByOperationIdService } from '../../services/ApServices/ApServices';

export default function BudgetManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [operation, setOperation] = useState(location.state?.operation || null);
  const [lots, setLots] = useState([]);
  const [partitions, setPartitions] = useState([]); // Add partitions state
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [engagementFormData, setEngagementFormData] = useState(null);

  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isPaymentDateModalOpen, setIsPaymentDateModalOpen] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [validationVisaCf, setValidationVisaCf] = useState('');
  const [validationDate, setValidationDate] = useState(new Date().toISOString().split('T')[0]);
  const [topSuppliers, setTopSuppliers] = useState({});

  const [engagementRows, setEngagementRows] = useState([]);
  const [paymentRows, setPaymentRows] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isAPModalOpen, setIsAPModalOpen] = useState(false);
  const [newAPValue, setNewAPValue] = useState('');

  useEffect(() => {
    if (engagementRows.length > 0 && !selectedEngagement) {
      setSelectedEngagement(engagementRows[0]);
    }
  }, [engagementRows]);

  const fetchEngagementsAndPayments = async () => {
    if (!id) return;

    setLoadingData(true);
    try {
      const response = await selectEngagementsAndPaymentByOperation(id);

      if (response.success && Array.isArray(response.data)) {
        const engagementsMap = new Map();
        const paymentsMap = new Map();

        response.data.forEach(item => {
          // Engagement mapping - using keys that match engagementColumns
          if (item.EngagementID && !engagementsMap.has(item.EngagementID)) {
            let engagementType = 'DEBIT';
            if (item.Type === 2) {
              engagementType = 'CREDIT';
            }

            const partition = partitions.find(p => p.Id === item.PartitionID);
            const travauxType = partition ? `${partition.TravauxTypeLabel || partition.TravauxType}` : '—';

            engagementsMap.set(item.EngagementID, {
              id: item.EngagementID,
              date: item.EngagementDate ? formatDate(item.EngagementDate) : '—',
              reference: item.Referece || '—',
              travauxType: travauxType,
              type: engagementType,
              amount: item.Amount || 0,
              status: item.EngagementStatus === 1 ? 'Pending' : 'Completed',
              rawAmount: item.Amount,
              rawStatus: item.EngagementStatus,
              lotId: item.LotID,
              partitionId: item.PartitionID,
              description: item.Description
            });
          }

          // Payment mapping - using keys that match paymentColumns
          if (item.PaymentID) {
            // Get travaux type from the engagement's partition
            const partition = partitions.find(p => p.Id === item.PartitionID);
            const travauxType = partition ? `${partition.TravauxTypeLabel || partition.TravauxType}` : '—';

            paymentsMap.set(item.PaymentID, {
              id: item.PaymentID,
              date: item.PaymentDate ? formatDate(item.PaymentDate) : '—',
              relatedEngagementReference: item.RelatedEngagementReference || '—',  // Matches 'relatedEngagementReference' key
              travauxType: travauxType,  // Matches 'travauxType' key
              relatedEngagementType: item.RelatedEngagementType === 1 ? 'DEBIT' : 'CREDIT',  // Matches 'relatedEngagementType' key
              status: item.PaymentStatus === 1 ? 'Pending' : 'Completed',  // Matches 'status' key
              engagementId: item.EngagementID,
              rawStatus: item.PaymentStatus
            });
          }
        });

        setEngagementRows(Array.from(engagementsMap.values()));
        setPaymentRows(Array.from(paymentsMap.values()));
      } else {
        console.error('Failed to fetch data:', response.message);
        setEngagementRows([]);
        setPaymentRows([]);
      }
    } catch (error) {
      console.error('Error fetching engagements and payments:', error);
      setEngagementRows([]);
      setPaymentRows([]);
      showToast('Failed to load budget data');
    } finally {
      setLoadingData(false);
    }
  };
  // Fetch partitions for the operation
  const fetchPartitions = async () => {
    if (!id) return;

    try {
      const response = await getPartitonsByOperationIdService(id);
      if (response.success && Array.isArray(response.data)) {
        setPartitions(response.data);
      } else {
        console.error('Failed to fetch partitions:', response.message);
        setPartitions([]);
      }
    } catch (error) {
      console.error('Error fetching partitions:', error);
      setPartitions([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchOperation = async () => {
      setLoading(true);

      try {
        const response = await getOperationByIdService(id);
        if (mounted && response.success) {
          setOperation(response.operation);
          setLots(response.lots || []);
        } else if (mounted) {
          setOperation(null);
          setLots([]);
        }
      } catch (error) {
        console.error("Error fetching operation:", error);
        if (mounted) {
          setOperation(null);
          setLots([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOperation();
      fetchPartitions(); // Fetch partitions when operation loads
      fetchEngagementsAndPayments();
    }

    return () => {
      mounted = false;
    };
  }, [id, user]);

  // Refetch engagements when partitions are loaded
  useEffect(() => {
    if (partitions.length > 0 && id) {
      fetchEngagementsAndPayments();
    }
  }, [partitions]);

  // NEW: Calculate total CREDIT engagements amount (sum of all credit type engagements)
  const totalCreditEngagementsAmount = useMemo(() => {
    let total = 0;
    engagementRows.forEach(engagement => {
      if (engagement.type === 'CREDIT') {
        total += Number(engagement.rawAmount) || 0;
      }
    });
    return total;
  }, [engagementRows]);

  const consumedBudgetValue = useMemo(() => {
    let total = 0;
    engagementRows.forEach(engagement => {
      const payment = paymentRows.find(p => p.engagementId === engagement.id);
      if (payment && payment.status === 'Completed' && engagement.type === 'DEBIT') {
        total += Number(engagement.rawAmount) || 0;
      }
    });
    return total;
  }, [engagementRows, paymentRows]);

  // Remaining Budget = AP - (Sum of all COMPLETED DEBIT payments) + (Sum of all COMPLETED CREDIT payments)
  const remainingBudgetValue = useMemo(() => {
    const ap = operation?.operationAP || operation?.AP || 0;

    // Sum of completed DEBIT payments (money spent)
    const completedDebits = engagementRows.reduce((sum, engagement) => {
      const payment = paymentRows.find(p => p.engagementId === engagement.id);
      if (payment && payment.status === 'Completed' && engagement.type === 'DEBIT') {
        return sum + (Number(engagement.rawAmount) || 0);
      }
      return sum;
    }, 0);

    // Sum of completed CREDIT payments (money returned)
    const completedCredits = engagementRows.reduce((sum, engagement) => {
      const payment = paymentRows.find(p => p.engagementId === engagement.id);
      if (payment && payment.status === 'Completed' && engagement.type === 'CREDIT') {
        return sum + (Number(engagement.rawAmount) || 0);
      }
      return sum;
    }, 0);

    const remaining = ap - completedDebits + completedCredits;
    return remaining < 0 ? 0 : remaining;
  }, [operation, engagementRows, paymentRows]);

  // Check if a new DEBIT engagement can be added
  const canAddDebitEngagement = (amount) => {
    const ap = operation?.operationAP || operation?.AP || 0;
    const totalExistingDebits = engagementRows.reduce((sum, engagement) => {
      const payment = paymentRows.find(p => p.engagementId === engagement.id);
      // Only count completed DEBIT payments as committed
      if (payment && payment.status === 'Completed' && engagement.type === 'DEBIT') {
        return sum + (Number(engagement.rawAmount) || 0);
      }
      return sum;
    }, 0);

    const totalExistingCredits = engagementRows.reduce((sum, engagement) => {
      const payment = paymentRows.find(p => p.engagementId === engagement.id);
      // Only count completed CREDIT payments as committed
      if (payment && payment.status === 'Completed' && engagement.type === 'CREDIT') {
        return sum + (Number(engagement.rawAmount) || 0);
      }
      return sum;
    }, 0);

    const available = ap - totalExistingDebits + totalExistingCredits;
    return amount <= available;
  };

  const apValue = useMemo(() => {
    const value = operation?.operationAP || operation?.AP || 0;
    return formatDZD(value);
  }, [operation]);

  const handleSaveEngagement = async () => {
    if (!engagementFormData) {
      showToast('Please fill in the form');
      return;
    }

    setIsSaving(true);

    try {
      if (!engagementFormData.type) {
        showToast('Please select engagement type (Debit or Credit)');
        setIsSaving(false);
        return;
      }

      if (!engagementFormData.reference) {
        showToast('Please enter a reference');
        setIsSaving(false);
        return;
      }
      if (!engagementFormData.date) {
        showToast('Please select a date');
        setIsSaving(false);
        return;
      }
      if (!engagementFormData.amount) {
        showToast('Please enter an amount');
        setIsSaving(false);
        return;
      }

      if (engagementFormData.type === 'DEBIT') {
        if (!engagementFormData.partition) {
          showToast('Please select a partition for Debit engagement');
          setIsSaving(false);
          return;
        }
        if (lots.length > 0 && !engagementFormData.lot) {
          showToast('Please select a lot for Debit engagement');
          setIsSaving(false);
          return;
        }
      }

      const newAmount = parseFloat(engagementFormData.amount);

      // For DEBIT engagements: Check if we have enough remaining budget
      if (engagementFormData.type === 'DEBIT') {
        if (!canAddDebitEngagement(newAmount)) {
          setErrorMessage(`Cannot add debit engagement of ${formatDZD(newAmount)}. Remaining budget: ${formatDZD(remainingBudgetValue)}`);
          setIsSaving(false);
          setIsEngagementModalOpen(false);
          return;
        }
      }

      // For CREDIT engagements: Only allowed when remaining budget is 0
      if (engagementFormData.type === 'CREDIT') {
        if (remainingBudgetValue > 0) {
          setErrorMessage(`Cannot add credit engagement because remaining budget is ${formatDZD(remainingBudgetValue)}. Credit engagements are only allowed when remaining budget is 0 DZD.`);
          setIsSaving(false);
          setIsEngagementModalOpen(false);
          return;
        }
      }

      const engagementData = {
        engagementId: engagementFormData.engagementId,
        lotId: engagementFormData.type === 'DEBIT' ? (engagementFormData.lot?.Id || engagementFormData.lot?.id) : null,
        partitionId: engagementFormData.type === 'DEBIT' ? (engagementFormData.partition?.Id || engagementFormData.partition?.id) : null, // Add partition ID
        operationId: id,
        reference: engagementFormData.reference,
        date: engagementFormData.date,
        amount: newAmount,
        type: engagementFormData.type,
        reason: engagementFormData.reason || '',
        visaCf: engagementFormData.visaCf || '',
        adminId: user.userId
      };

      const response = await insertEngagement(engagementData);

      if (response.success) {
        await fetchEngagementsAndPayments();
        setErrorMessage('');
        setIsEngagementModalOpen(false);
        setEngagementFormData(null);

        if (engagementFormData.type === 'CREDIT') {
          showToast(`Credit engagement created successfully. It will increase remaining budget by ${formatDZD(newAmount)} once payment is completed.`);
        } else {
          showToast(`${engagementFormData.type} engagement created successfully`);
        }
      } else {
        showToast(response.message || 'Failed to save engagement');
      }
    } catch (error) {
      console.error('Error saving engagement:', error);
      showToast(error.message || 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEngagementStatusClick = (row) => {
    if (row.status === 'Pending') {
      setSelectedEngagement(row);
      setIsValidationModalOpen(true);
    }
  };

  const handlePaymentStatusClick = (row) => {
    if (row.status === 'Pending') {
      setSelectedPayment(row);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setIsPaymentDateModalOpen(true);
    }
  };

  const handleValidateEngagement = async () => {
    if (!selectedEngagement || !validationVisaCf || !validationDate) {
      showToast('Please enter the Visa CF and date');
      return;
    }

    setIsSaving(true);

    try {
      const response = await validateEngagement(
        selectedEngagement.id,
        validationVisaCf,
        validationDate,
        user.userId
      );

      if (response.success) {
        await fetchEngagementsAndPayments();
        setIsValidationModalOpen(false);
        setValidationVisaCf('');
        setValidationDate(new Date().toISOString().split('T')[0]);
        setSelectedEngagement(null);
        showToast('Engagement validated successfully');
      } else {
        showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentDate = async () => {
    if (!selectedPayment || !paymentDate) {
      showToast('Please select a payment and date');
      return;
    }

    setIsSaving(true);
    try {
      const response = await updatePayment(selectedPayment.id, paymentDate);

      if (response.success) {
        await fetchEngagementsAndPayments();
        setIsPaymentDateModalOpen(false);
        setSelectedPayment(null);

        // Find the engagement type to show appropriate message
        const engagement = engagementRows.find(e => e.id === selectedPayment.engagementId);
        if (engagement) {
          if (engagement.type === 'DEBIT') {
            showToast(`Debit payment completed. Consumed budget increased by ${engagement.amount}`);
          } else {
            showToast(`Credit payment completed. Remaining budget increased by ${engagement.amount}`);
          }
        }
      } else {
        showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadEngagement = async () => {
    if (!selectedEngagement) {
      showToast('Please select an engagement to download');
      return;
    }

    try {
      setIsSaving(true);
      // Ensure the engagement has all required fields
      const engagementForPDF = {
        ...selectedEngagement,
        dateEngagement: selectedEngagement.date || selectedEngagement.dateEngagement || new Date().toLocaleDateString(),
        cfVisaNumber: selectedEngagement.reference || selectedEngagement.cfVisaNumber || '—',
        numeroMarche: selectedEngagement.numeroMarche || operation?.Numero || '2024/08',
        amount: selectedEngagement.rawAmount || selectedEngagement.amount || 0,
        type: selectedEngagement.type === 'DEBIT' ? 1 : 2, // Convert to numeric type for PDF
        Status: selectedEngagement.status === 'Completed' ? 2 : 1
      };

      console.log('Generating Engagement PDF with:', engagementForPDF);

      // Deep clone to prevent react-pdf from mutating state and causing cross-interference
      const safeOperation = operation ? JSON.parse(JSON.stringify(operation)) : null;
      const safeEngagement = JSON.parse(JSON.stringify(engagementForPDF));
      const safeLots = lots ? JSON.parse(JSON.stringify(lots)) : [];
      const safeAllEngagements = JSON.parse(JSON.stringify(
        engagementRows.map(e => ({
          ...e,
          dateEngagement: e.date || e.dateEngagement,
          cfVisaNumber: e.reference || e.cfVisaNumber,
          rawAmount: e.rawAmount || e.amount,
          type: e.type === 'DEBIT' ? 1 : 2
        }))
      ));

      const asPdf = pdf();
      asPdf.updateContainer(
        <EngagementReactPDFDocument
          operation={safeOperation}
          engagement={safeEngagement}
          lots={safeLots}
          allEngagements={safeAllEngagements}
        />
      );
      const blob = await asPdf.toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `engagement_${selectedEngagement.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      showToast('Engagement PDF generated successfully');
    } catch (error) {
      console.error('PDF generation Error:', error);
      showToast('Failed to generate Engagement PDF: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPayment = async (paymentRow) => {
    console.log('=== handleDownloadPayment called ===');
    console.log('Payment row received:', paymentRow);

    // Validate payment row
    if (!paymentRow) {
      console.error('Payment row is undefined/null');
      showToast('No payment selected. Please try again.');
      return;
    }

    if (!paymentRow.id) {
      console.error('Payment row has no id:', paymentRow);
      showToast('Invalid payment data. Please refresh and try again.');
      return;
    }

    try {
      // Find the associated engagement using engagementId from the payment
      console.log('Looking for engagement with id:', paymentRow.engagementId);
      console.log('Available engagements:', engagementRows);

      const engagement = engagementRows.find(e => e.id === paymentRow.engagementId);

      if (!engagement) {
        console.error('Engagement not found for payment:', paymentRow);
        showToast('Associated engagement not found. Please refresh the page.');
        return;
      }

      console.log('Found engagement:', engagement);

      // Prepare engagement data for PDF (mapping to format expected by PaymentReactPDFDocument)
      const engagementForPDF = {
        id: engagement.id,
        reference: engagement.reference,
        dateEngagement: engagement.date || new Date().toLocaleDateString('fr-CA'),
        cfVisaNumber: engagement.reference,
        amount: engagement.rawAmount || engagement.amount || 0,
        type: engagement.type === 'DEBIT' ? 1 : 2,
        Status: engagement.status === 'Completed' ? 2 : 1,
        lotId: engagement.lotId,
        numeroMarche: operation?.Numero || '2024/08',
        description: engagement.description || ''
      };

      // Prepare payment data for PDF
      const paymentForPDF = {
        id: paymentRow.id,
        datePayment: paymentRow.date || new Date().toLocaleDateString('fr-CA'),
        status: paymentRow.status,
        relatedEngagementReference: paymentRow.relatedEngagementReference,
        date: paymentRow.date
      };

      setIsSaving(true);
      let supplier = null;

      // Fetch supplier based on lotId OR operationId
      try {
        let response;

        // Check if engagement has a valid lotId
        const hasValidLotId = engagement.lotId;

        if (hasValidLotId) {
          // Case 1: Operation has lots - get supplier by LotID
          console.log('Fetching supplier by LotID:', engagement.lotId);
          response = await getTopSupplierService(engagement.lotId, id);
        } else {
          // Case 2: Operation has no lots - get supplier by OperationID
          console.log('No valid LotID, fetching supplier by OperationID:', id);
          response = await getTopSupplierService(null, id);
        }

        if (response.success && response.supplier) {
          supplier = response.supplier;
          console.log('Supplier found:', supplier);
        } else {
          console.warn('No supplier found for:', hasValidLotId ? `lot ${engagement.lotId}` : `operation ${id}`);
        }
      } catch (supplierError) {
        console.error("Failed to fetch supplier:", supplierError);
      }

      // Generate PDF
      console.log('Generating PDF with:', {
        operation,
        engagement: engagementForPDF,
        payment: paymentForPDF,
        supplier
      });

      // Deep clone to prevent react-pdf from mutating state and causing cross-interference
      const safeOperation = operation ? JSON.parse(JSON.stringify(operation)) : null;
      const safeEngagement = JSON.parse(JSON.stringify(engagementForPDF));
      const safePayment = JSON.parse(JSON.stringify(paymentForPDF));
      const safeSupplier = supplier ? JSON.parse(JSON.stringify(supplier)) : null;

      const asPdf = pdf();
      asPdf.updateContainer(
        <PaymentReactPDFDocument
          operation={safeOperation}
          engagement={safeEngagement}
          payment={safePayment}
          supplier={safeSupplier}
          paymentData={safePayment}
        />
      );
      const blob = await asPdf.toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment_${paymentRow.id}_${engagement.reference}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      showToast('Payment PDF generated and downloaded successfully');
    } catch (error) {
      console.error("Payment download error:", error);
      showToast("Failed to generate Payment PDF: " + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const engagementColumns = useMemo(
    () => [
      { key: 'date', label: t('budget.engagementTable.columns.dateEngagement') || 'Date', icon: CalendarDays },
      { key: 'reference', label: t('budget.engagementTable.columns.engagmentRef') || 'Ref', icon: FileBadge },
      { key: 'travauxType', label: t('budget.engagementTable.columns.travauxType') || 'Works', icon: Layers },
      { key: 'type', label: t('budget.engagementTable.columns.type') || 'Type', icon: ClipboardCheck },
      { key: 'amount', label: t('budget.engagementTable.columns.amount') || 'Amount', icon: CircleDollarSign },
      { key: 'status', label: t('budget.engagementTable.columns.status') || 'Status', icon: ClipboardCheck }
    ],
    [t]
  );

  const paymentColumns = useMemo(
    () => [
      { key: 'date', label: t('budget.paymentTable.columns.datePayment') || 'Date', icon: CalendarDays },
      { key: 'relatedEngagementReference', label: t('budget.engagementTable.columns.engagmentRef') || 'Eng. Ref', icon: Hash },
      { key: 'travauxType', label: t('budget.engagementTable.columns.travauxType') || 'Works', icon: Layers },
      { key: 'relatedEngagementType', label: t('budget.engagementTable.columns.type') || 'Type', icon: ClipboardCheck },
      { key: 'status', label: t('budget.paymentTable.columns.status') || 'Status', icon: ReceiptText }
    ],
    [t]
  );
  const cards = [
    {
      title: t('budget.cards.totalAllocated'),
      value: operation?.operationAP || operation?.AP || 0,  // Raw number, not formatted
      icon: Wallet,
      creditAdjustment: totalCreditEngagementsAmount > 0 ? totalCreditEngagementsAmount : null
    },
    {
      title: t('budget.cards.consumedBudget'),
      value: consumedBudgetValue,  // Raw number
      icon: HandCoins
    },
    {
      title: t('budget.cards.budgetRemaining'),
      value: remainingBudgetValue,  // Raw number
      icon: CircleDollarSign,
      onAction: () => {
        setNewAPValue(operation?.operationAP || operation?.AP || '');
        setIsAPModalOpen(true);
      }
    }
  ];

  return (
    <>
      <Sidebar activeSection="budget" onSectionChange={(sectionId) => navigate('/admin', { state: { activeSection: sectionId } })} />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4 md:p-6">
        {/* Remove max-w-7xl and mx-auto to allow full width */}
        <div className="space-y-4 w-full">
          {loading && (
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs">
              Loading operation data...
            </div>
          )}

          {loadingData && (
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs">
              Loading budget data...
            </div>
          )}

          {!operation && !loading && (
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded text-xs">
              No operation data loaded
            </div>
          )}

          <BudgetAlerts
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            isOverBudget={remainingBudgetValue < 0}
          />

          <BudgetStatCards cards={cards} />

          {/* Remove flex-col lg:flex-row and use grid for better responsiveness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0">
              <BudgetDataTable
                title={t('budget.engagementTable.title')}
                titleIcon={ClipboardCheck}
                columns={engagementColumns}
                rows={engagementRows}
                onDownloadClick={handleDownloadEngagement}
                onAddClick={() => {
                  setIsEngagementModalOpen(true);
                }}
                onRowClick={setSelectedEngagement}
                selectedRowId={selectedEngagement?.id}
                onStatusClick={handleEngagementStatusClick}
              />
            </div>
            <div className="min-w-0">
              <BudgetDataTable
                title={t('budget.paymentTable.title')}
                titleIcon={ReceiptText}
                columns={paymentColumns}
                rows={paymentRows}
                onRowDownloadClick={handleDownloadPayment}
                onStatusClick={handlePaymentStatusClick}
              />
            </div>
          </div>
        </div>
      </div>

      <FormModal
        isOpen={isEngagementModalOpen}
        onClose={() => {
          setIsEngagementModalOpen(false);
          setEngagementFormData(null);
        }}
        onSave={handleSaveEngagement}
        title={t('budget.newEngagementForm.title')}
        saveText={isSaving ? 'Saving...' : t('budget.newEngagementForm.save')}
        disableSave={isSaving}
      >
        <NewEngagementForm
          lots={lots}
          partitions={partitions} // Pass partitions to the form
          initialData={{}}
          onDataChange={setEngagementFormData}
        />
      </FormModal>

      <ValidateEngagementModal
        isOpen={isValidationModalOpen}
        onClose={() => {
          setIsValidationModalOpen(false);
          setValidationVisaCf('');
          setValidationDate(new Date().toISOString().split('T')[0]);
        }}
        onSave={handleValidateEngagement}
        isSaving={isSaving}
        selectedEngagement={selectedEngagement}
        validationVisaCf={validationVisaCf}
        setValidationVisaCf={setValidationVisaCf}
        validationDate={validationDate}
        setValidationDate={setValidationDate}
        t={t}
      />

      <PaymentDateModal
        isOpen={isPaymentDateModalOpen}
        onClose={() => setIsPaymentDateModalOpen(false)}
        onSave={handleSavePaymentDate}
        isSaving={isSaving}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        t={t}
      />
    </>
  );
}