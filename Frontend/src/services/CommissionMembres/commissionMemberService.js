import api from '../../utils/api';
import * as yup from 'yup';

const addCommissionMemberApi = `http://localhost:5000/api/cm/addCommissionMember`;
const getAllCommissionMembersApi = `http://localhost:5000/api/cm/AllCommissionMembers`;
const deleteCommissionMemberApi = (id) => `http://localhost:5000/api/cm/deleteCommissionMember/${id}`;
const updateCommissionMemberApi = 'http://localhost:5000/api/cm/updateCommissionMember';

const commissionMemberSchema = yup.object().shape({
    Nom: yup.string().required("Le nom du membre est requis."),
    Prenom: yup.string().required("Le prénom du membre est requis."),
    Fonction: yup.string(),
    Email: yup.string().required("L'email est requis."),
    Role: yup.string().required("Le rôle du membre est requis."),
    adminId: yup.string().required("L'identifiant administrateur est requis."),
});

export const newCommissionMember = (formData) => {
    return api(addCommissionMemberApi, 'POST', formData, commissionMemberSchema);
};

export const getAllCommissionMembers = (adminId) => {
    const url = new URL(getAllCommissionMembersApi);
    url.searchParams.append('adminId', adminId); 
    
    return api(url.toString(), 'GET')
        .then(data => {
            if (data.success) {
                return data.members || []; 
            } else {
                throw new Error(data.message || 'Failed to fetch members');
            }
        });
};

export const deleteCommissionMember = (id) => {
    return api(deleteCommissionMemberApi(id), 'DELETE');
};

export const updateCommissionMember = (memberId, formData) => {
    return api(`${updateCommissionMemberApi}/${memberId}`, 'PUT', formData);
};