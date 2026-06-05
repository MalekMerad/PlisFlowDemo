import api from '../../utils/api';
import * as yup from 'yup';

const addAnnonceApi = `http://localhost:5000/api/ann/addAnnonce`;
const getAllAnnoncesApi = `http://localhost:5000/api/ann/AllAnnonces`;
const deleteAnnonceApi = (id) => `http://localhost:5000/api/ann/deleteAnnonce/${id}`;
const updateAnnonceApi = 'http://localhost:5000/api/ann/updateAnnonce';
const validateAnnonceApi = (annonceId) => `http://localhost:5000/api/ann/validateAnnonce/${annonceId}`;
const endReceptionApi = (annonceId) => `http://localhost:5000/api/ann/endReception/${annonceId}`;

const annonceSchema = yup.object().shape({
    Id_Operation: yup.string().required(),
    Numero: yup.string().required(),
    Date_Publication: yup.string().required(),
    Journal: yup.string().required(),
    Delai: yup.string().required(),
    Date_Overture: yup.string().required(),
    Heure_Ouverture: yup.string(),
    adminId: yup.string().required(),
});

export const newAnnonce = (formData) => {
    console.log('SENDING newAnnounce :', formData)
    return api(addAnnonceApi, 'POST', formData, annonceSchema);
};

export const getAllAnnonces = (adminID, operationID) => {
    if (!adminID || !operationID || operationID === 'undefined') {
        return Promise.resolve({ success: true, annonces: [], count: 0 });
    }

    const url = new URL(getAllAnnoncesApi);
    url.searchParams.append('adminID', adminID);
    url.searchParams.append('operationID', operationID);

    return api(url.toString(), 'GET')
        .then(data => {
            if (data.success) {
                return {
                    annonces: data.annonces,
                    count: data.count
                };
            } else {
                throw new Error(data.message || 'Failed to fetch annonces');
            }
        });
};

export const deleteAnnonce = (id) => {
    return api(deleteAnnonceApi(id), 'DELETE');
};

export const updateAnnonce = (formData) => {
    return api(updateAnnonceApi, 'PUT', formData);
};

export const validateAnnonce = (annonceId) => {
    const id = annonceId != null ? String(annonceId).trim() : '';
    if (!id || id === 'null' || id === 'undefined') {
        return Promise.resolve({ success: false, message: 'Identifiant annonce manquant.' });
    }
    return api(validateAnnonceApi(encodeURIComponent(id)), 'PATCH');
};

export const endAnnounceReception = (annonceId) => {
    const id = annonceId != null ? String(annonceId).trim() : '';
    if (!id || id === 'null' || id === 'undefined') {
        return Promise.resolve({ success: false, message: 'Identifiant annonce manquant.' });
    }
    return api(endReceptionApi(encodeURIComponent(id)), 'PATCH');
};
