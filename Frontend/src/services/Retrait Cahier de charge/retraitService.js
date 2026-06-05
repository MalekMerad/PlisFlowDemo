import api from '../../utils/api';
import * as yup from 'yup';
// import i18n for translations
import i18n from "i18next";

const createRetraitApi = 'http://localhost:5000/api/retrait/createRetrait';
const getSuppliersWithOperationsApi = (adminId) => `http://localhost:5000/api/retrait/suppliers/${adminId}`;
const deleteRetraitApi = (supplierId, operationId) => `http://localhost:5000/api/retrait/deleteRetrait?supplierId=${supplierId}&operationId=${operationId}`;
const getRetraitsWithSpecsApi = (annonceID) => `http://localhost:5000/api/retrait/retraitsWithSpecs?annonceID=${annonceID}`;

const retraitSchema = yup.object().shape({
    SupplierID: yup.string().required(),
    OperationID: yup.string().required(),
    NumeroRetrait: yup.string().required(),
    adminId: yup.string().required(),
});

export const createRetrait = (formData) => {
    console.log(' Sending retrait data to API:', formData);

    return api(createRetraitApi, 'POST', formData, retraitSchema)
        .then(result => {
            console.log('API Response:', result);
            if (result.success) {
                return {
                    success: true,
                    message:
                        result.message ||
                        i18n.t('specificationsSection.retraitCreatedSuccess', 'Retrait enregistré avec succès'),
                    data: result.data
                };
            } else if (result.code === 1001) {
                return {
                    success: false,
                    message: i18n.t(
                        'specificationsSection.numeroRetraitExists',
                        'Le numéro de retrait existe déjà pour cette opération et fournisseur'
                    )
                };
            } else {
                return {
                    success: false,
                    message:
                        result.message ||
                        i18n.t('specificationsSection.createError', 'Erreur lors de la création du retrait')
                };
            }
        })
        .catch(error => {
            console.error('[createRetrait] API Error:', error);
            if (error.name === 'ValidationError') {
                return { success: false, message: error.errors.join(', ') };
            }
            return {
                success: false,
                message: error.message ||
                    i18n.t('specificationsSection.serverError', 'Erreur de connexion au serveur')
            };
        });
};

export const getSuppliersWithOperations = (adminId) => {
    console.log(' Fetching suppliers with operations, adminId:', adminId);

    return api(getSuppliersWithOperationsApi(adminId), 'GET')
        .then(result => {
            console.log('API Response:', result);

            if (result.success) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                return {
                    success: false,
                    message: result.message ||
                        i18n.t('specificationsSection.suppliersLoadError', 'Erreur lors du chargement des fournisseurs')
                };
            }
        })
        .catch(error => {
            console.error('[getSuppliersWithOperations] API Error:', error);
            return {
                success: false,
                message: error.message ||
                    i18n.t('specificationsSection.serverError', 'Erreur de connexion au serveur')
            };
        });
};

export const deleteRetrait = (supplierId, operationId) => {
    console.log('Deleting retrait with SupplierID:', supplierId, 'OperationID:', operationId);

    return api(deleteRetraitApi(supplierId, operationId), 'DELETE')
        .then(result => {
            console.log('API Response:', result);
            if (result.success) {
                return {
                    success: true,
                    message: result.message || i18n.t('specificationsSection.retraitDeleteSuccess', 'Retrait supprimé avec succès'),
                    code: result.code
                };
            } else {
                return {
                    success: false,
                    message: result.message || i18n.t('specificationsSection.deleteError', 'Erreur lors de la suppression'),
                    code: result.code
                };
            }
        })
        .catch(error => {
            console.error('[deleteRetrait] API Error:', error);
            return {
                success: false,
                message: error.message || i18n.t('specificationsSection.serverError', 'Erreur de connexion au serveur'),
                code: 5000
            };
        });
};

export const getRetraitsWithSpecs = (annonceID) => {
    console.log('Fetching retraits with specs for annonceID:', annonceID);

    return api(getRetraitsWithSpecsApi(annonceID), 'GET')
        .then(result => {
            if (result.success) {
                return { success: true, data: result.data };
            } else {
                return {
                    success: false,
                    message: result.message || i18n.t('specificationsSection.retraitsLoadError', 'Erreur lors du chargement des retraits')
                };
            }
        })
        .catch(error => ({
            success: false,
            message: error.message || i18n.t('specificationsSection.serverError', 'Erreur de connexion au serveur')
        }));
};