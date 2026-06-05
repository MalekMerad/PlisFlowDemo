import api from '../../utils/api';
import * as yup from 'yup';

const addLotApi = 'http://localhost:5000/api/lot/addLot';
const getAllLotsApi = 'http://localhost:5000/api/lot/getAllLots';
const updateLotApi = (lotId) => `http://localhost:5000/api/lot/updateLot/${lotId}`;
const deleteLotApi = (lotId) => `http://localhost:5000/api/lot/deleteLot/${lotId}`;

const lotSchema = yup.object().shape({
    NumeroLot: yup.string().required(),
    Designation: yup.string().required(),
    id_Operation: yup.string().required(),
});

export const addNewLotService = (formData) => {
    return api(addLotApi, 'POST', formData, lotSchema);
};

export const getAllLotsService = (adminID, operationID) => {
    if (!adminID) {
        return Promise.reject(new Error('adminID is required'));
    }
    if (!operationID) {
        return Promise.reject(new Error('operationID is required'));
    }
    const urlWithParams = `${getAllLotsApi}?adminID=${encodeURIComponent(adminID)}&operationID=${encodeURIComponent(operationID)}`;

    return api(urlWithParams, 'GET');
};

export const updateLotService = (lotId, designation) => {
    return api(updateLotApi(lotId), 'PUT', { designation });
};

export const deleteLotService = (lotId) => {
    const url = deleteLotApi(lotId);
    console.log("Deleting lot with URL:", url);
    console.log("Lot ID being sent:", lotId);
    return api(url, 'DELETE');
};
