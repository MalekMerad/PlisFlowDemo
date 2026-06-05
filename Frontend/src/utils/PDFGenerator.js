import {
    getSessionsWithOperationsService,
    getMembersBySessionService,
    getEvaluationByOperationService
} from '../services/Evaluation/evaluationServices';
import { getOperationByIdService } from '../services/Operations/operationService';
import { uploadDocumentService } from '../services/Documents/documentService';

const DOC_API_URL = 'http://localhost:5000/api/doc';

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

const uploadGeneratedPDFBlob = async (pdfBlob, sessionID, operationID, adminId, type, filename) => {
    try {
        const formData = new FormData();
        formData.append('document', pdfBlob, filename);
        formData.append('SessionID', sessionID);
        formData.append('OperationID', operationID);
        formData.append('AdminID', adminId);
        formData.append('DocumentType', type);

        const result = await uploadDocumentService(formData);
        if (!result.success) {
            console.error(`Failed to auto-store ${type}:`, result.message);
        }
    } catch (error) {
        console.error(`Error uploading ${type}:`, error);
    }
};

const fetchFullSessionData = async (sessionID, adminId, operationID) => {
    // Fetch all sessions for this admin, then find the one by sessionID
    const sessionRes = await getSessionsWithOperationsService(adminId);
    if (!sessionRes.success) throw new Error("Failed to fetch session data");

    const session = sessionRes.data.find(s => s.SessionID === sessionID);
    if (!session) throw new Error("Session not found");

    // Fetch session members
    const membersRes = await getMembersBySessionService(sessionID);
    const members = membersRes.success ? membersRes.members : [];

    // Fetch operation (with announces) by operationID
    const operationRes = await getOperationByIdService(operationID);
    if (!operationRes.success) {
        throw new Error(operationRes.message || "Failed to fetch operation data");
    }
    const { operation, lots, announces, message } = operationRes;

    // Only use the operation that matches operationID from the session
    const op = session.operations.find(
        o => (o.OperationID || o.Id || o.id) === operationID
    );
    if (!op) {
        throw new Error("Operation not found in this session");
    }

    // Fetch only this operation's evaluation(s)
    const evalRes = await getEvaluationByOperationService(operationID);
    let fullOperation = {
        ...op,
        ...operation, // merge main operation data from DB if needed
        lots: lots || [],
        announces: announces || [],
        evaluations: evalRes.success ? evalRes.evaluations || [] : [],
        suppliers: evalRes.success ? evalRes.suppliers || [] : []
    };

    return {
        session,
        members,
        operations: [fullOperation]
    };
};

const renderPVWithWkhtmltopdf = async ({ type, data, filename }) => {
    const response = await fetch(`${DOC_API_URL}/render-pv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, filename }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
        if (contentType.includes('application/json')) {
            const err = await response.json();
            throw new Error(err?.message || err?.details || 'PDF generation failed');
        }
        const text = await response.text();
        throw new Error(text || 'PDF generation failed');
    }

    return await response.blob();
};

const formatFilenameDate = (dateString) => {
    if (!dateString) return "unknown";
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}_${hh}-${min}`;
};

/**
 * Overture-only document (per operation)
 */
export const generateOverturePV = async (sessionID, operationID, adminId) => {
    const data = await fetchFullSessionData(sessionID, adminId, operationID);

    const dateStr = formatFilenameDate(data.session.SessionDateTime);
    const op = data.operations[0] || {};
    const opLabel = op.Numero || op.OperationID || op.Id || op.id || "OP";
    const filename = `PV_Ouverture_${opLabel}_${dateStr}.pdf`;
    const pdfBlob = await renderPVWithWkhtmltopdf({
        type: "PV_OUVERTURE",
        data,
        filename
    });
    downloadBlob(pdfBlob, filename);
    await uploadGeneratedPDFBlob(pdfBlob, sessionID, operationID, adminId, "PV_OUVERTURE", filename);
    return filename;
};

/**
 * Evaluation document = Technical + Financial (per operation)
 */
export const generateEvaluationPV = async (sessionID, operationID, adminId) => {
    const data = await fetchFullSessionData(sessionID, adminId, operationID);

    const dateStr = formatFilenameDate(data.session.SessionDateTime);
    const op = data.operations[0] || {};
    const opLabel = op.Numero || op.OperationID || op.Id || op.id || "OP";
    const filename = `PV_Evaluation_${opLabel}_${dateStr}.pdf`;
    const pdfBlob = await renderPVWithWkhtmltopdf({
        type: "PV_EVALUATION",
        data,
        filename
    });
    downloadBlob(pdfBlob, filename);
    await uploadGeneratedPDFBlob(pdfBlob, sessionID, operationID, adminId, "PV_EVALUATION", filename);
    return filename;
};