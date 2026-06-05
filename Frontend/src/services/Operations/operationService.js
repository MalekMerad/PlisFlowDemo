import api from '../../utils/api';
import * as yup from 'yup';

// Operation APIs
const addOperationApi = 'http://localhost:5000/api/opr/addOperation';
const getAllOperationsApi = 'http://localhost:5000/api/opr/AllOperations';
const deleteOperationApi = (operationID) => `http://localhost:5000/api/opr/deleteOperation/${operationID}`;
const manageArchiveOperationApi = (id) => `http://localhost:5000/api/opr/manageArchiveOperation/${id}`;
const getOperationByIdApi = (op) => `http://localhost:5000/api/opr/operationById/${op}`;
const updateOperationApi = 'http://localhost:5000/api/opr/updateOperation';
const validateOperationApi = (operationId) => `http://localhost:5000/api/opr/validateOperation/${operationId}`;
const getOperationsByDateApi = 'http://localhost:5000/api/opr/get-by-date';
const getOperationForBudgetManagementApi = 'http://localhost:5000/api/opr/get-operationBudgetManagement';

const operationSchema = yup.object().shape({
    NumOperation: yup.string().required(),
    ServContract: yup.string().required(),
    Objectif: yup.string().required(),
    TravalieType: yup.string().required(),
    BudgetType: yup.string().required(),
    MethodAttribuation: yup.string().required(),
    VisaNum: yup.string().required(),
    DateVisa: yup.date().required(),
    adminID: yup.string().required(),
});

// ---- Operation Weights Schema ----
const operationWeightSchema = yup.object().shape({
    TechnicalWeight: yup.number().required(),
    FinancialWeight: yup.number().required(),
});

export const newOperation = (formData) => {
    console.log(' Sending operation data:', formData);
    return api(addOperationApi, 'POST', formData, operationSchema);
};

export const getOperations = (adminID) => {
    if (!adminID) {
        return Promise.reject(new Error('adminID is required'));
    }

    const urlWithParams = `${getAllOperationsApi}?adminID=${encodeURIComponent(adminID)}`;
    return api(urlWithParams, 'GET')
        .then(data => data.data || []);
};

export const deleteOperationService = async (operationID) => {
    try {
        const res = await api(deleteOperationApi(operationID), 'DELETE');

        switch (res.code) {
            case 0:
                return {
                    success: true,
                    code: 0,
                    message: "Opération archivée avec succès."
                };
            case 1000:
                return {
                    success: false,
                    code: 1000,
                    message: "Impossible d'archiver cette opération car elle est liée à des fournisseurs."
                };
            case 1005:
                return {
                    success: false,
                    code: 1005,
                    message: "Opération introuvable."
                };
            default:
                return {
                    success: false,
                    code: res.code || 5000,
                    message: res.message || "Erreur interne serveur SQL lors de l'archivage de l'opération."
                };
        }
    } catch (error) {
        return {
            success: false,
            code: 5000,
            message: "Erreur lors de l'archivage de l'opération.",
            error: error.message
        };
    }
};

export const manageArchiveOperation = async (id) => {
    if (!id) {
        return Promise.reject(new Error('Operation id is required'));
    }
    return api(manageArchiveOperationApi(id), 'PATCH');
};

export const getOperationByIdService = async (op) => {
    if (!op) {
        return Promise.reject(new Error('Operation id is required'));
    }
    try {
        const res = await api(getOperationByIdApi(op), 'GET');
        if (res.success) {
            return {
                success: true,
                operation: res.operation,
                lots: res.lots,
                announces: res.announces,
                message: res.message
            };
        } else {
            return {
                success: false,
                message: res.message || "Database error occurred in getOperationByIdSqlServer.",
                error: res.error
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
};

export const updateOperation = (formData) => {
    console.log('Sending operation update data:', formData);
    return api(updateOperationApi, 'PUT', formData, operationSchema);
};

export const updateOperationState = async (operationId, newState) => {
    return api(
        `http://localhost:5000/api/opr/updateOperationState/${operationId}`,
        'PATCH',
        { state: newState }
    );
};


export const validateOperationService = async (operationId) => {
    if (!operationId) {
        return Promise.reject(new Error('operationId is required'));
    }
    try {
        const res = await api(validateOperationApi(operationId), 'PATCH');
        if (res.success) {
            return {
                success: true,
                message: res.message
            };
        } else {
            return {
                success: false,
                message: res.message || "Erreur lors de la validation de l'opération.",
                error: res.error || undefined
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Erreur interne lors de la validation de l'opération.",
            error: error.message
        };
    }
};

export const getOperationsByDateService = async (adminId, sessionDate) => {
    try {
        const response = await api(getOperationsByDateApi, 'POST', {
            adminId,
            sessionDate
        });
        return response;
    } catch (error) {
        console.error("Error fetching operations by date:", error);
        return { success: false, data: [] };
    }
};

export const getOperationForBudgetManagementService = async (adminId) => {
    try {
        const response = await api(`${getOperationForBudgetManagementApi}?adminId=${adminId}`, 'GET');
        return response;
    } catch (error) {
        console.error("Error fetching operations for budget management:", error);
        return { success: false, data: [] };
    }
};
