import api from '../../utils/api';
import * as yup from 'yup';

const baseUrl = 'http://localhost:5000/api/admin';

/**
 *  Validation Schema
 */
const adminSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email invalide.")
    .required("L'email est requis."),
  password: yup
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères.")
    .required("Le mot de passe est requis."),
  nom_prenom: yup
    .string()
    .nullable(),
  function: yup
    .string()
    .nullable(),
});

/**
 *Get all admins
 */
export const fetchAdmins = async () => {
  const data = await api(`${baseUrl}/admins`, 'GET');
  return data.admins || [];
};

/**
 *  Create new admin
 * role = 1 et state = 1 par défaut (gérés dans le backend)
 */
export const createAdmin = async (formData) => {
  return await api(
    `${baseUrl}/admins`,
    'POST',
    {
      email: formData.email,
      password: formData.password,
      nom_prenom: formData.nom_prenom || null,
      function: formData.function || null,
    },
    adminSchema
  );
};

/**
 *  Toggle admin state (activate / deactivate)
 */
export const toggleAdminState = async (id, newState) => {
  return await api(
    `${baseUrl}/admins/${id}/state`,
    'PATCH',
    { newState }
  );
};

/**
 * Delete admin
 */
export const deleteAdmin = async (id) => {
  return await api(
    `${baseUrl}/admins/${id}`,
    'DELETE'
  );
};
