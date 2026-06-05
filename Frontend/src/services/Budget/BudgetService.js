import api from "../../utils/api";
import * as yup from "yup";

const insertEngagementApi = "http://localhost:5000/api/budget/insertEngagement";
const selectEngagementsByOperationApi = (operationId) =>
    `http://localhost:5000/api/budget/selectEngagementsAndPaymentByOperation/${encodeURIComponent(operationId)}`;
const validateEngagementApi = (engagementId) => `http://localhost:5000/api/budget/validateEngagement/${engagementId}`;

// BudgetService.js - Update the engagement schema and insertEngagement function

const engagementSchema = yup.object().shape({
    lotId: yup.string().nullable().default(null),
    partitionId: yup.string().nullable().default(null), // Add partitionId field
    operationId: yup.string().required("L'opération est requise."),
    reference: yup.string().required("La référence est requise."),
    date: yup.string().required("La date est requise."),
    amount: yup.string().required("Le montant est requis."),
    type: yup.string().required("Le type est requis."),
    reason: yup.string().required("La raison est requise."),
    visaCf: yup.string().nullable(),
    adminId: yup.string().required("L'administrateur est requis."),
});

export const insertEngagement = (formData) => {
    const dataWithPartition = {
        ...formData,
        partitionId: formData.partitionId || null
    };
    return api(insertEngagementApi, "POST", dataWithPartition, engagementSchema);
};

export const selectEngagementsAndPaymentByOperation = (operationId) => {
    return api(selectEngagementsByOperationApi(operationId), "GET", null, null);
};

export const validateEngagement = (engagementId, visaCf, dateVisa, adminId) => {
    return api(validateEngagementApi(engagementId, visaCf, dateVisa, adminId), "PUT", { visaCf, dateVisa, adminId }, null);
};
