import api from '../../utils/api';
import * as yup from 'yup';

const addSupplierApi = 'http://localhost:5000/api/supplier/addSupplier';
const getAllSuppliersApi = `http://localhost:5000/api/supplier/getAllSuppliers`;
const deleteSupplierApi = (id) => `http://localhost:5000/api/supplier/deleteSupplier/${id}`;
const updateSupplierApi = 'http://localhost:5000/api/supplier/updateSupplier';
const insertSelectedSupplierApi = 'http://localhost:5000/api/supplier/insertSelectedSupplier';
const getTopSupplierApi = 'http://localhost:5000/api/supplier/getTopSupplier';

const supplierSchema = yup.object().shape({
  Nom: yup.string().required(),
  NatureJuridique: yup.string().required(),
  Adresse: yup.string().required(),
  Telephone: yup.string().required(),
  Rc: yup.string().required(),
  Nif: yup.string().required(),
  Rib: yup.string().required(),
  Email: yup.string().email().required(),
  Ai: yup.string().required(),
  AgenceBancaire: yup.string().required(),
  adminId: yup.string().required(),
});

export const newSupplier = (formData) => {
  const dataToSend = {
    Nom: formData.Nom,
    RaisonSocial: formData.RaisonSocial,
    NatureJuridique: formData.NatureJuridique,
    Adresse: formData.Adresse,
    Telephone: formData.Telephone,
    Rc: formData.Rc,
    Nif: formData.Nif,
    Rib: formData.Rib,
    Email: formData.Email,
    Ai: formData.Ai,
    AgenceBancaire: formData.AgenceBancaire,
    DateDepot: formData.DateDepot,
    adminId: formData.adminId || formData.adminID || ''
  };

  return api(addSupplierApi, 'POST', dataToSend, supplierSchema)
    .then(result => {
      if (result.code === 0) {
        return { success: true, code: 0, supplier: result.supplier || dataToSend };
      } else {
        return { success: false, code: result.code, message: result.message };
      }
    });
};

export const getAllSuppliers = async (adminID) => {
  const urlWithParams = `${getAllSuppliersApi}?adminID=${encodeURIComponent(adminID)}`;
  console.log(' Fetch all suppliers with adminID: ', adminID);
  return api(urlWithParams, 'GET');
};

export const getSupplierByIdService = async (id) => {
  try {
    const url = `http://localhost:5000/api/supplier/getSupplierById/${id}`;
    const res = await api(url, 'GET');
    return res;
  } catch (error) {
    console.error('Frontend error (getSupplierByIdService):', error);
    return { success: false, code: 5000, message: "Erreur de connexion au serveur." };
  }
};

export const deleteSupplierService = async (id) => {
  try {
    const res = await api(deleteSupplierApi(id), 'DELETE');
    switch (res.code) {
      case 0:
        return {
          success: true,
          code: 0,
          message: "Fournisseur supprimé avec succès."
        };
      case 2000:
        return {
          success: false,
          code: 2000,
          message: "Impossible de supprimer ce fournisseur car il existe dans une opération de retrait (Retrait Cahier des Charges)."
        };
      case 2005:
        return {
          success: false,
          code: 2005,
          message: "Fournisseur introuvable ou déjà archivé."
        };
      default:
        if (!res.success) {
          return {
            success: false,
            code: res.code || 5000,
            message: res.message || "Erreur interne serveur SQL lors de la suppression du fournisseur."
          };
        }
        return res;
    }
  } catch (error) {
    return {
      success: false,
      code: 5000,
      message: "Erreur lors de la suppression du fournisseur.",
      error: error.message
    };
  }
};

export const updateSupplier = async (formData) => {
  try {
    const dataToSend = {
      Id: formData.Id || formData.id || formData.ID,
      Nom: formData.Nom,
      RaisonSocial: formData.RaisonSocial,
      DateDepot: formData.DateDepot,
      NatureJuridique: formData.NatureJuridique,
      Adresse: formData.Adresse,
      Telephone: formData.Telephone,
      Rc: formData.Rc,
      Nif: formData.Nif,
      Rib: formData.Rib,
      Email: formData.Email,
      Ai: formData.Ai,
      AgenceBancaire: formData.AgenceBancaire
    };

    const res = await api(updateSupplierApi, 'PUT', dataToSend);
    return res;
  } catch (error) {
    console.error('Frontend error (updateSupplier):', error);
    return { success: false, code: 5000, message: "Erreur de connexion au serveur." };
  }
};


export const addSelectedSupplier = async (supplierData) => {
  try {
    const payload = {
      Nom: supplierData.Nom,
      RaisonSocial: supplierData.RaisonSocial,
      DateDepot: supplierData.DateDepot,
      Adresse: supplierData.Adresse,
      Telephone: supplierData.Telephone,
      Email: supplierData.Email,
      adminID: supplierData.adminId
    };

    const res = await api(insertSelectedSupplierApi, 'POST', payload);

    return res;

  } catch (error) {
    console.error('Error inserting selected supplier:', error);
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur."
    };
  }
};

export const getTopSupplierService = async (lotId, operationId) => {
  try {
    let url = `${getTopSupplierApi}?operationId=${encodeURIComponent(operationId)}`;

    if (lotId && lotId !== 'undefined' && lotId !== 'null') {
      url += `&lotId=${encodeURIComponent(lotId)}`;
    }

    const res = await api(url, 'GET');

    // The response now directly contains supplier object
    return res;
  } catch (error) {
    console.error('Frontend error (getTopSupplierService):', error);
    return { success: false, code: 5000, message: "Erreur de connexion au serveur." };
  }
};
