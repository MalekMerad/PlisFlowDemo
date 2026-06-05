import api from '../../utils/api';
import * as yup from 'yup';

const insertNewEvaluationApi = 'http://localhost:5000/api/eval/addEvaluation';
const insertNewSessionApi = 'http://localhost:5000/api/eval/addSession';
const getSessionsApi = 'http://localhost:5000/api/eval/sessions';
const getMembersBySessionApi = sessionId => `http://localhost:5000/api/eval/membersBySession/${sessionId}`;
const getEvaluationsByOperationApi = operationId => `http://localhost:5000/api/eval/evaluationsByOperation/${operationId}`;
const deleteEvaluationApi = 'http://localhost:5000/api/eval/deleteEvaluation';
const updateSessionPresenceApi = 'http://localhost:5000/api/eval/presence';
const closeSessionApi = sessionId => `http://localhost:5000/api/eval/closeSession/${sessionId}`;

export const createSessionService = (sessionDateTime, operations, adminId) => {
    console.log("createSessionService sending:", {
        sessionDateTime,
        operations,
        adminId
    });
    return api(insertNewSessionApi, 'POST', {
        SessionDateTime: sessionDateTime,
        operations: operations,
        adminId: adminId
    });
};

export const getSessionsWithOperationsService = (adminId) => {
    console.log("Fetching sessions for admin:", adminId);
    return api(`${getSessionsApi}/${adminId}`, 'GET');
};

export const getMembersBySessionService = async (sessionId) => {
    if (!sessionId) {
        throw new Error("SessionId is required.");
    }
    return api(getMembersBySessionApi(sessionId), 'GET');
};

export const getEvaluationByOperationService = async (operationId) => {
    if (!operationId) {
        throw new Error("OperationID is required.");
    }
    return api(getEvaluationsByOperationApi(operationId), 'GET');
};

const evaluationSchema = yup.object().shape({
    IdSession: yup.string().required('Session ID is required'),
    IdOperation: yup.string().required('Operation ID is required'),
    IdLot: yup.string().nullable(),
    IdSupplier: yup.string().required('Supplier ID is required'),
    ScoreAdministrative: yup.number().required('Administrative decision is required').min(0).max(1),
    ScoreTechnique: yup.number().nullable().min(0),
    ScoreFinancier: yup.number().nullable().min(0),
    FinalNote: yup.number().nullable().min(0),
    RejectionReason: yup.string().nullable() // New field
});

export const insertNewEvaluationService = (evaluationData) => {
    return api(insertNewEvaluationApi, 'POST', evaluationData, evaluationSchema);
};

export const deleteEvaluationService = (payload) => {
    return api(deleteEvaluationApi, 'POST', payload);
};

export const updateSessionPresenceService = (payload) => {
    return api(updateSessionPresenceApi, 'POST', payload);
};

export const closeSessionEvaluationService = async (sessionId) => {
    if (!sessionId) {
        throw new Error("SessionID is required.");
    }
    return api(closeSessionApi(sessionId), 'PATCH');
};

export const deleteOperationFromSessionService = async (sessionId, operationId) => {
    if (!sessionId || !operationId) {
        throw new Error("SessionID and OperationID are required.");
    }
    return api(`http://localhost:5000/api/eval/sessions/${sessionId}/operations/${operationId}`, 'DELETE');
};