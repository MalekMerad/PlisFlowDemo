import { getOperationByIdService } from '../../services/Operations/operationService';
import { getPartitonsByOperationIdService } from '../../services/ApServices/ApServices';

export const fetchOperationDetails = async (opId) => {
  if (!opId) {
    return {
      success: false,
      message: 'Operation id is required'
    };
  }
  try {
    // Fetch all data in parallel
    const [operationResult, apPartitionsResult] = await Promise.all([
      getOperationByIdService(opId),
      getPartitonsByOperationIdService(opId).catch(error => {
        console.error('Error fetching AP partitions:', error);
        return { success: false, data: [] };
      })
    ]);

    const apPartitions = apPartitionsResult.success ? (apPartitionsResult.data || []) : [];

    if (operationResult.success) {
      return {
        success: true,
        operation: operationResult.operation,
        lots: operationResult.lots || [],
        announces: operationResult.announces || [],
        suppliers: operationResult.suppliers || [],
        apPartitions: apPartitions,
        message: operationResult.message
      };
    } else {
      return {
        success: false,
        message: operationResult.message || 'Database error occurred in getOperationByIdSqlServer.',
        error: operationResult.error,
        apPartitions: []
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Internal server error',
      error: error.message,
      apPartitions: []
    };
  }
};