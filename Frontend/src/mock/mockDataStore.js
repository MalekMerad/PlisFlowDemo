import { ReverseTravauxTypeMap } from '../services/ApServices/ApServices';

const createId = () => crypto.randomUUID();

const emptyStore = () => ({
  suppliers: [],
  operations: [],
  lots: [],
  annonces: [],
  apPartitions: [],
  commissionMembers: [],
  sessions: [],
  sessionOperationLinks: [],
  sessionPresence: {},
  evaluations: [],
  retraits: [],
  admins: [
    { id: 'admin-user-1', email: 'admin1@gmail.com', nom_prenom: 'Admin One', function: 'Gestionnaire', role: 1, state: 1 },
    { id: 'admin-user-2', email: 'admin2@gmail.com', nom_prenom: 'Admin Two', function: 'Super Admin', role: 2, state: 1 },
    { id: 'admin-user-3', email: 'admin3@gmail.com', nom_prenom: 'Admin Three', function: 'Gestionnaire', role: 1, state: 1 },
  ],
  engagements: [],
  payments: [],
  documents: [],
});

let store = emptyStore();

export const resetMockDataStore = () => {
  store = emptyStore();
};

export const getMockStore = () => store;

export const generateId = createId;

export const MOCK_AUTH_USERS = {
  'admin1@gmail.com': { userId: 'admin-user-1', role: 1, token: 'mock-token-admin1' },
  'admin2@gmail.com': { userId: 'admin-user-2', role: 2, token: 'mock-token-admin2' },
  'admin3@gmail.com': { userId: 'admin-user-3', role: 1, token: 'mock-token-admin3' },
};

export const mapTravauxType = (value) => {
  if (typeof value === 'number') return value;
  return ReverseTravauxTypeMap[value] || 1;
};

export const mapBudgetType = (value) => {
  const map = { Equipement: 1, Fonctionnement: 2, 'Opérations Hors Budget': 3 };
  return typeof value === 'number' ? value : (map[value] || 1);
};

export const mapModeAttribuation = (value) => {
  const map = { "Appel d'Offres Ouvert": 1, "Appel d'Offres Restreint": 2 };
  return typeof value === 'number' ? value : (map[value] || 1);
};

export const mapTravauxTypeFromForm = (value) => {
  const map = { Travaux: 1, Prestations: 2, Equipement: 3, Etude: 4 };
  return typeof value === 'number' ? value : (map[value] || 1);
};

export const filterByAdmin = (items, adminId, field = 'adminId') => {
  if (!adminId) return items;
  return items.filter((item) => {
    const itemAdmin = item[field] || item.adminID || item.AdminId || item.AdminID;
    return !itemAdmin || String(itemAdmin) === String(adminId);
  });
};
