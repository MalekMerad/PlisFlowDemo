// services/apPartitionsService.js
import api from '../../utils/api';
import * as yup from 'yup';

// API endpoints
const getPartitonsByOperationIdApi = (operationId) => `http://localhost:5000/api/apPartitions/getPartitonsByOperationId/${operationId}`;
const createApPartitionApi = 'http://localhost:5000/api/apPartitions/createApPartition';
const updateApPartitionApi = 'http://localhost:5000/api/apPartitions/updateApPartition';
const deleteApPartitonApi = (id) => `http://localhost:5000/api/apPartitions/deleteApPartiton/${id}`;

// Type mapping for travaux types
export const TravauxTypeMap = {
    1: 'Travaux',
    2: 'Prestations',
    3: 'Equipement',
    4: 'Etude'
};

export const ReverseTravauxTypeMap = {
    'Travaux': 1,
    'Prestations': 2,
    'Equipement': 3,
    'Etude': 4
};

// Validation schema for creating a partition
const createApPartitionSchema = yup.object().shape({
    operationId: yup.string().uuid('Invalid operation ID').required('Operation ID is required'),
    travauxType: yup.number()
        .oneOf([1, 2, 3, 4], 'Type de travaux doit être 1 (Travaux), 2 (Prestations), 3 (Equipement), ou 4 (Etude)')
        .required('Type de travaux is required'),
    description: yup.string()
        .max(100, 'La description ne peut pas dépasser 100 caractères')
        .nullable(),
    budget: yup.number()
        .positive('Le budget doit être un nombre positif')
        .min(0, 'Le budget ne peut pas être négatif')
        .required('Budget is required')
});

// Validation schema for updating a partition
const updateApPartitionSchema = yup.object().shape({
    id: yup.string().uuid('Invalid partition ID').required('Partition ID is required'),
    description: yup.string()
        .max(100, 'La description ne peut pas dépasser 100 caractères')
        .nullable(),
    budget: yup.number()
        .positive('Le budget doit être un nombre positif')
        .min(0, 'Le budget ne peut pas être négatif')
        .nullable()
}).test('at-least-one-field', 'Au moins un champ (description ou budget) doit être fourni', function (value) {
    return value.description !== undefined || value.budget !== undefined;
});

// Get all partitions by operation ID
export const getPartitonsByOperationIdService = (operationId) => {
    if (!operationId) {
        return Promise.reject(new Error('operationId is required'));
    }
    const url = getPartitonsByOperationIdApi(operationId);
    return api(url, 'GET');
};

// Get partition details (analytics)
export const getPartitionDetailsService = (partitionId, operationId) => {
    if (!partitionId || !operationId) {
        return Promise.reject(new Error('partitionId and operationId are required'));
    }
    const url = `http://localhost:5000/api/apPartitions/${partitionId}/details?operationId=${operationId}`;
    return api(url, 'GET');
};

// Create a new partition
export const createApPartitionService = (formData) => {
    return api(createApPartitionApi, 'POST', formData, createApPartitionSchema);
};

// Update an existing partition
export const updateApPartitionService = (id, description, budget) => {
    const formData = { id, description, budget };
    return api(updateApPartitionApi, 'PUT', formData, updateApPartitionSchema);
};

// Delete a partition
export const deleteApPartitonService = (id) => {
    if (!id) {
        return Promise.reject(new Error('Partition ID is required'));
    }
    const url = deleteApPartitonApi(id);
    return api(url, 'DELETE');
};

// Helper function to get type label
export const getTravauxTypeLabel = (typeValue) => {
    return TravauxTypeMap[typeValue] || 'Unknown';
};

// Get all available travaux types as array for dropdowns
export const getTravauxTypesList = () => {
    return Object.entries(TravauxTypeMap).map(([value, label]) => ({
        value: parseInt(value),
        label: label
    }));
};
