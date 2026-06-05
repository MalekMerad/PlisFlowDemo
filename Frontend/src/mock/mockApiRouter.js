import {
  getMockStore,
  generateId,
  filterByAdmin,
  mapTravauxType,
  mapBudgetType,
  mapModeAttribuation,
  mapTravauxTypeFromForm,
} from './mockDataStore';
import { TravauxTypeMap } from '../services/ApServices/ApServices';

const delay = (ms = 50) => new Promise((r) => setTimeout(r, ms));

const parseUrl = (url) => {
  try {
    return new URL(url, 'http://localhost');
  } catch {
    return new URL(`http://localhost${url.startsWith('/') ? url : `/${url}`}`);
  }
};

const getQuery = (parsed, key) => parsed.searchParams.get(key);

const findOperation = (id) => getMockStore().operations.find((o) => String(o.Id) === String(id));

const findSupplier = (id) => getMockStore().suppliers.find((s) => String(s.Id) === String(id));

const operationLots = (operationId) =>
  getMockStore().lots.filter((l) => String(l.id_Operation || l.Id_Operation) === String(operationId));

const operationAnnonces = (operationId) =>
  getMockStore().annonces.filter((a) => String(a.Id_Operation) === String(operationId));

const normalizeSupplier = (s) => ({
  ...s,
  DateDepot: s.DateDepot || s.dateDepot || '',
  dateDepot: s.dateDepot || s.DateDepot || '',
});

const normalizeLot = (lot) => ({
  ...lot,
  Id: lot.Id,
  id: lot.Id || lot.id,
});

const normalizeAnnonce = (ann, { assignIdIfMissing = false } = {}) => {
  let id = ann.Id || ann.id;
  if (!id || id === 'null' || id === 'undefined') {
    if (assignIdIfMissing) {
      id = generateId();
    } else {
      id = null;
    }
  }
  return {
    ...ann,
    ...(id ? { Id: id, id } : {}),
    Status: ann.Status ?? ann.State ?? 2,
    ReceptionEnded: Boolean(ann.ReceptionEnded),
  };
};

const ensureAnnonceIds = () => {
  getMockStore().annonces.forEach((ann, idx) => {
    if (!ann.Id || ann.Id === 'null') {
      getMockStore().annonces[idx] = normalizeAnnonce(ann, { assignIdIfMissing: true });
    }
  });
};

const normalizePartition = (p) => ({
  ...p,
  Id: p.Id,
  OperationId: p.operationId || p.OperationId,
  TravauxType: p.travauxType ?? p.TravauxType,
  Description: p.description ?? p.Description ?? '',
  Budget: Number(p.budget ?? p.Budget ?? 0),
  TravauxTypeLabel: TravauxTypeMap[p.travauxType ?? p.TravauxType] || p.TravauxTypeLabel,
});

const sessionOperations = (sessionId) => {
  const store = getMockStore();
  const links = store.sessionOperationLinks.filter((l) => String(l.sessionId) === String(sessionId));
  return links
    .map((l) => findOperation(l.operationId))
    .filter(Boolean)
    .map((op) => {
      const lots = operationLots(op.Id);
      return {
        OperationID: op.Id,
        Id: op.Id,
        Numero: op.Numero,
        ...op,
        Lots: lots,
        lots: lots,
        LotsCount: lots.length,
        lotsCount: lots.length,
      };
    });
};

// --- Handlers by domain ---

const supplierHandlers = {
  getAll: (adminID) => {
    const suppliers = filterByAdmin(getMockStore().suppliers, adminID, 'adminId').map(normalizeSupplier);
    return { success: true, suppliers, code: 0 };
  },
  add: (body) => {
    const supplier = normalizeSupplier({
      Id: generateId(),
      Status: 1,
      ...body,
      adminId: body.adminId || body.adminID,
      DateDepot: body.DateDepot || body.dateDepot || '',
    });
    getMockStore().suppliers.push(supplier);
    return { success: true, code: 0, supplier };
  },
  update: (body) => {
    const idx = getMockStore().suppliers.findIndex((s) => String(s.Id) === String(body.Id));
    if (idx === -1) return { success: false, code: 2005, message: 'Fournisseur introuvable.' };
    getMockStore().suppliers[idx] = normalizeSupplier({
      ...getMockStore().suppliers[idx],
      ...body,
      DateDepot: body.DateDepot || body.dateDepot || getMockStore().suppliers[idx].DateDepot,
    });
    return { success: true, code: 0 };
  },
  delete: (id) => {
    const store = getMockStore();
    const usedInRetrait = store.retraits.some((r) => String(r.SupplierID) === String(id));
    if (usedInRetrait) return { success: false, code: 2000, message: 'Impossible de supprimer ce fournisseur.' };
    const idx = store.suppliers.findIndex((s) => String(s.Id) === String(id));
    if (idx === -1) return { success: false, code: 2005, message: 'Fournisseur introuvable.' };
    store.suppliers.splice(idx, 1);
    return { success: true, code: 0, message: 'Fournisseur supprimé avec succès.' };
  },
  getById: (id) => {
    const supplier = findSupplier(id);
    return supplier ? { success: true, supplier } : { success: false, code: 2005 };
  },
  insertSelected: (body) => {
    const result = supplierHandlers.add({ ...body, adminId: body.adminID || body.adminId });
    return { ...result, data: result.supplier };
  },
  getTop: (lotId, operationId) => {
    const store = getMockStore();
    let evals = store.evaluations.filter((e) => String(e.IdOperation) === String(operationId));
    if (lotId) evals = evals.filter((e) => String(e.IdLot) === String(lotId));
    evals.sort((a, b) => (b.FinalNote || 0) - (a.FinalNote || 0));
    const top = evals[0];
    if (!top) return { success: false, message: 'No supplier found' };
    const supplier = findSupplier(top.IdSupplier);
    return { success: true, supplier };
  },
};

const operationHandlers = {
  getAll: (adminID) => {
    const data = filterByAdmin(getMockStore().operations, adminID, 'adminID');
    return { success: true, data };
  },
  add: (body) => {
    const op = {
      Id: generateId(),
      Numero: body.NumOperation,
      Service_Contractant: body.ServContract,
      Objet: body.Objectif,
      TypeTravaux: mapTravauxTypeFromForm(body.TravalieType),
      TypeBudget: mapBudgetType(body.BudgetType),
      ModeAttribuation: mapModeAttribuation(body.MethodAttribuation),
      NumeroVisa: body.VisaNum,
      DateVisa: body.DateVisa,
      Program: body.Program || '',
      AP: body.AP || '',
      State: 2,
      adminID: body.adminID || body.adminId,
    };
    getMockStore().operations.push(op);
    return { success: true, code: 0, data: op };
  },
  update: (body) => {
    const idx = getMockStore().operations.findIndex((o) => String(o.Id) === String(body.Id));
    if (idx === -1) return { success: false, message: 'Opération introuvable.' };
    const existing = getMockStore().operations[idx];
    getMockStore().operations[idx] = {
      ...existing,
      Numero: body.NumOperation ?? existing.Numero,
      Service_Contractant: body.ServContract ?? existing.Service_Contractant,
      Objet: body.Objectif ?? existing.Objet,
      TypeTravaux: body.TravalieType ? mapTravauxTypeFromForm(body.TravalieType) : existing.TypeTravaux,
      TypeBudget: body.BudgetType ? mapBudgetType(body.BudgetType) : existing.TypeBudget,
      ModeAttribuation: body.MethodAttribuation ? mapModeAttribuation(body.MethodAttribuation) : existing.ModeAttribuation,
      NumeroVisa: body.VisaNum ?? existing.NumeroVisa,
      DateVisa: body.DateVisa ?? existing.DateVisa,
      Program: body.Program ?? existing.Program,
      AP: body.AP ?? existing.AP,
    };
    return { success: true, code: 0 };
  },
  delete: (id) => {
    const idx = getMockStore().operations.findIndex((o) => String(o.Id) === String(id));
    if (idx === -1) return { success: false, code: 1005, message: 'Opération introuvable.' };
    getMockStore().operations[idx].State = -1;
    return { success: true, code: 0, message: 'Opération archivée avec succès.' };
  },
  manageArchive: (id) => {
    const op = findOperation(id);
    if (!op) return { success: false, code: 1005 };
    op.State = op.State === 0 ? 1 : 0;
    return { success: true, code: 0 };
  },
  getById: (id) => {
    const op = findOperation(id);
    if (!op) return { success: false, message: 'Opération introuvable.' };
    ensureAnnonceIds();
    return {
      success: true,
      operation: op,
      lots: operationLots(id).map(normalizeLot),
      announces: operationAnnonces(id).map((a) => normalizeAnnonce(a)),
      suppliers: getMockStore().suppliers.map(normalizeSupplier),
      message: 'OK',
    };
  },
  validate: (id) => {
    const op = findOperation(id);
    if (!op) return { success: false, message: 'Opération introuvable.' };
    op.State = 1;
    return { success: true, message: 'Opération validée.' };
  },
  updateState: (id, body) => {
    const op = findOperation(id);
    if (!op) return { success: false };
    op.State = body.state;
    return { success: true };
  },
  getByDate: (body) => {
    const sessionDateTime = new Date(body.sessionDate).getTime();
    const ops = filterByAdmin(getMockStore().operations, body.adminId, 'adminID')
      .filter((op) => {
        if (op.State !== 3) return false;
        const annList = operationAnnonces(op.Id);
        const ann = annList.find((a) => a.Status !== 0 && a.Date_Overture);
        if (!ann) return false;
        return new Date(ann.Date_Overture).getTime() <= sessionDateTime;
      })
      .map((op) => ({ ...op, id: op.Id, OperationId: op.Id }));
    return { success: true, data: ops };
  },
  getBudgetList: (adminId) => {
    const data = filterByAdmin(getMockStore().operations, adminId, 'adminID').filter((o) => o.State === 4);
    return { success: true, data };
  },
};

const annonceHandlers = {
  getAll: (adminID, operationID) => {
    ensureAnnonceIds();
    const annonces = getMockStore().annonces
      .filter((a) => String(a.Id_Operation) === String(operationID))
      .map((a) => normalizeAnnonce(a));
    return { success: true, annonces, count: annonces.length };
  },
  add: (body) => {
    const { Id: _discardId, id: _discardId2, ...rest } = body || {};
    const annonce = normalizeAnnonce({
      ...rest,
      Id: generateId(),
      Status: 2,
      ReceptionEnded: false,
    });
    getMockStore().annonces.push(annonce);
    return { success: true, code: 0, annonce };
  },
  update: (body) => {
    const idx = getMockStore().annonces.findIndex((a) => String(a.Id) === String(body.Id));
    if (idx === -1) return { success: false, code: 1005, message: 'Annonce introuvable.' };
    getMockStore().annonces[idx] = normalizeAnnonce({ ...getMockStore().annonces[idx], ...body });
    return { success: true, code: 0 };
  },
  delete: (id) => {
    const ann = getMockStore().annonces.find((a) => String(a.Id) === String(id));
    if (!ann) return { success: false, code: 1005, message: 'Annonce introuvable.' };
    ann.Status = 0;
    return { success: true, code: 0 };
  },
  validate: (id) => {
    ensureAnnonceIds();
    if (!id || id === 'null' || id === 'undefined') {
      return { success: false, message: 'Identifiant annonce manquant.' };
    }
    const ann = getMockStore().annonces.find((a) => String(a.Id) === String(id));
    if (!ann) return { success: false, message: 'Annonce introuvable.' };
    ann.Status = 1;
    ann.ReceptionEnded = false;
    return { success: true, code: 0, message: 'Annonce validée avec succès.' };
  },
  endReception: (id) => {
    const ann = getMockStore().annonces.find((a) => String(a.Id) === String(id));
    if (!ann) return { success: false, message: 'Annonce introuvable.' };
    if (ann.Status !== 1) return { success: false, message: "L'annonce doit être validée avant de clôturer la réception." };
    ann.ReceptionEnded = true;
    return { success: true, code: 0 };
  },
};

const lotHandlers = {
  add: (body) => {
    const lot = normalizeLot({ Id: generateId(), ...body, id_Operation: body.id_Operation });
    getMockStore().lots.push(lot);
    return { success: true, code: 0, lot };
  },
  update: (lotId, body) => {
    const lot = getMockStore().lots.find((l) => String(l.Id) === String(lotId));
    if (!lot) return { success: false, message: 'Lot introuvable.' };
    lot.Designation = body.designation ?? lot.Designation;
    return { success: true, code: 0 };
  },
  delete: (lotId) => {
    const before = getMockStore().lots.length;
    getMockStore().lots = getMockStore().lots.filter((l) => String(l.Id) !== String(lotId));
    if (getMockStore().lots.length === before) {
      return { success: false, message: 'Lot introuvable.' };
    }
    return { success: true, code: 0 };
  },
};

const apHandlers = {
  getByOperation: (operationId) => {
    const data = getMockStore().apPartitions
      .filter((p) => String(p.operationId) === String(operationId))
      .map(normalizePartition);
    return { success: true, data };
  },
  create: (body) => {
    const partition = normalizePartition({
      Id: generateId(),
      operationId: body.operationId,
      travauxType: Number(body.travauxType),
      description: body.description || '',
      budget: Number(body.budget),
    });
    getMockStore().apPartitions.push(partition);
    return { success: true, code: 0, data: partition };
  },
  update: (body) => {
    const p = getMockStore().apPartitions.find((x) => String(x.Id) === String(body.id));
    if (!p) return { success: false, message: 'Partition introuvable.' };
    if (body.description !== undefined) p.description = body.description;
    if (body.budget !== undefined) p.budget = Number(body.budget);
    Object.assign(p, normalizePartition(p));
    return { success: true, code: 0 };
  },
  delete: (id) => {
    getMockStore().apPartitions = getMockStore().apPartitions.filter((p) => String(p.Id) !== String(id));
    return { success: true, code: 0 };
  },
  details: (partitionId, operationId) => {
    const partition = getMockStore().apPartitions.find((p) => String(p.Id) === String(partitionId));
    if (!partition) {
      return { success: false, message: 'Partition introuvable.' };
    }

    const engagements = getMockStore().engagements.filter(
      (e) => String(e.partitionId) === String(partitionId) && String(e.operationId) === String(operationId)
    );

    const payments = getMockStore().payments.filter((p) =>
      engagements.some((e) => String(e.EngagementID) === String(p.engagementId))
    );

    // Number of validated engagements
    const validatedEngagementsCount = engagements.filter((e) => e.status === 2).length;
    // Number of pending engagements
    const pendingEngagementsCount = engagements.filter((e) => e.status === 1).length;

    // Number of approved payments
    const validatedPaymentsCount = payments.filter((p) => p.status === 2).length;
    // Number of pending payments
    const pendingPaymentsCount = payments.filter((p) => p.status === 1).length;

    // Consumed budget: Sum of validated DEBIT engagements that have completed payments
    // Remaining budget: partition.budget - completed debits + completed credits
    let completedDebits = 0;
    let completedCredits = 0;

    engagements.forEach((eng) => {
      const pay = payments.find((p) => String(p.engagementId) === String(eng.EngagementID));
      if (pay && pay.status === 2) {
        if (eng.type === 1 || eng.type === 'DEBIT') {
          completedDebits += Number(eng.amount || 0);
        } else if (eng.type === 2 || eng.type === 'CREDIT') {
          completedCredits += Number(eng.amount || 0);
        }
      }
    });

    const consumedBudget = completedDebits;
    const remainingBudget = Number(partition.budget || 0) - completedDebits + completedCredits;

    // Line chart shows partition budget progress with details on how much has been spent and when.
    // Timeline events are completed payments. Let's filter engagements that have completed payments.
    const paidEngagements = engagements.filter((eng) => {
      const pay = payments.find((p) => String(p.engagementId) === String(eng.EngagementID));
      return pay && pay.status === 2;
    });

    // Sort paid engagements by payment date (or fallback to engagement date if payment date is missing)
    paidEngagements.sort((a, b) => {
      const payA = payments.find((p) => String(p.engagementId) === String(a.EngagementID));
      const payB = payments.find((p) => String(p.engagementId) === String(b.EngagementID));
      const dateA = new Date(payA?.date || a.date);
      const dateB = new Date(payB?.date || b.date);
      return dateA - dateB;
    });

    const timeline = [
      {
        date: 'Initial',
        remainingBudget: Number(partition.budget || 0),
        amountReduced: 0,
        cumulativeReduced: 0,
        reference: '',
        engagementDescription: 'Initial Budget',
      }
    ];

    let currentRemaining = Number(partition.budget || 0);
    let cumulativeReduced = 0;

    paidEngagements.forEach((eng) => {
      const pay = payments.find((p) => String(p.engagementId) === String(eng.EngagementID));
      const eventDate = pay?.date || eng.date;
      const amount = Number(eng.amount || 0);
      const isDebit = eng.type === 1 || eng.type === 'DEBIT';

      if (isDebit) {
        currentRemaining -= amount;
        cumulativeReduced += amount;
      } else {
        currentRemaining += amount;
        cumulativeReduced -= amount;
      }

      timeline.push({
        date: eventDate,
        remainingBudget: currentRemaining,
        amountReduced: isDebit ? amount : -amount,
        cumulativeReduced: cumulativeReduced,
        reference: eng.reference || '',
        engagementDescription: eng.reason || eng.description || '',
      });
    });

    // Make sure we have both lowercase and uppercase keys for partition properties
    const partitionRes = {
      ...partition,
      budget: Number(partition.budget || 0),
      remainingBudget: remainingBudget,
    };

    return {
      success: true,
      partition: partitionRes,
      stats: {
        engagements: {
          validated: validatedEngagementsCount,
          pending: pendingEngagementsCount,
        },
        payments: {
          validated: validatedPaymentsCount,
          pending: pendingPaymentsCount,
        },
      },
      timeline,
      engagements: engagements.map((eng) => ({
        reference: eng.reference || '',
        date: eng.date,
        amount: Number(eng.amount || 0),
        description: eng.reason || eng.description || '',
      })),
    };
  },
};

const commissionHandlers = {
  getAll: (adminId) => {
    const members = filterByAdmin(getMockStore().commissionMembers, adminId, 'adminId');
    return { success: true, members };
  },
  add: (body) => {
    const member = { Id: generateId(), ...body };
    getMockStore().commissionMembers.push(member);
    return { success: true, code: 0, member, id: member.Id };
  },
  update: (memberId, body) => {
    const m = getMockStore().commissionMembers.find((x) => String(x.Id) === String(memberId));
    if (!m) return { success: false };
    Object.assign(m, body);
    return { success: true, code: 0 };
  },
  delete: (id) => {
    getMockStore().commissionMembers = getMockStore().commissionMembers.filter(
      (m) => String(m.Id) !== String(id)
    );
    return { success: true, code: 0 };
  },
};

const evalHandlers = {
  getSessions: (adminId) => {
    const sessions = filterByAdmin(getMockStore().sessions, adminId, 'adminId').map((s) => ({
      ...s,
      operations: sessionOperations(s.SessionID),
    }));
    return { success: true, data: sessions };
  },
  addSession: (body) => {
    const sessionId = generateId();
    const session = {
      SessionID: sessionId,
      SessionDateTime: body.SessionDateTime,
      adminId: body.adminId,
      EvaluationClosed: 0,
    };
    getMockStore().sessions.push(session);
    (body.operations || []).forEach((op) => {
      const opId = typeof op === 'object' ? (op.OperationId || op.operationId || op.id) : op;
      getMockStore().sessionOperationLinks.push({ sessionId, operationId: opId });
    });
    return { success: true, session, sessionId };
  },
  membersBySession: (sessionId) => {
    const members = getMockStore().sessionPresence[sessionId];
    if (!members) return { success: true, members: [] };
    return { success: true, members };
  },
  presence: (body) => {
    const sessionId = body.SessionID || body.SessionId || body.sessionId;
    if (!getMockStore().sessionPresence[sessionId]) {
      getMockStore().sessionPresence[sessionId] = [];
    }
    const members = getMockStore().sessionPresence[sessionId];
    const cm = getMockStore().commissionMembers.find((m) => String(m.Id) === String(body.MemberID));
    const existing = members.find((m) => String(m.Id) === String(body.MemberID));
    if (existing) {
      existing.Status = body.Status;
    } else if (cm) {
      members.push({ Id: cm.Id, Nom: cm.Nom, Prenom: cm.Prenom, Role: cm.Role, Status: body.Status });
    } else {
      members.push({ Id: body.MemberID, Nom: '', Prenom: '', Role: '', Status: body.Status });
    }
    return { success: true, code: 0 };
  },
  closeSession: (sessionId) => {
    const s = getMockStore().sessions.find((x) => String(x.SessionID) === String(sessionId));
    if (s) {
      s.EvaluationClosed = 1;
      const ops = sessionOperations(sessionId);
      ops.forEach((op) => {
        const storeOp = findOperation(op.Id);
        if (storeOp) storeOp.State = 4;
      });
    }
    return { success: true, code: 0 };
  },
  deleteOpFromSession: (sessionId, operationId) => {
    getMockStore().sessionOperationLinks = getMockStore().sessionOperationLinks.filter(
      (l) => !(String(l.sessionId) === String(sessionId) && String(l.operationId) === String(operationId))
    );
    return { success: true, code: 0 };
  },
  evaluationsByOperation: (operationId) => {
    const store = getMockStore();
    const evaluations = store.evaluations
      .filter((e) => String(e.IdOperation) === String(operationId))
      .map((e) => {
        const supplier = findSupplier(e.IdSupplier);
        const lot = store.lots.find((l) => String(l.Id) === String(e.IdLot));
        return {
          EvaluationID: e.Id,
          SupplierID: e.IdSupplier,
          LotID: e.IdLot,
          Nom: supplier?.Nom || '',
          NumeroLot: lot?.NumeroLot || '',
          AdminNote: e.ScoreAdministrative,
          TechnicalNote: e.ScoreTechnique,
          FinancialNote: e.ScoreFinancier,
          FinalNote: e.FinalNote,
          RejectionReason: e.RejectionReason,
        };
      });
    const op = findOperation(operationId);
    const retraits = store.retraits.filter((r) => String(r.OperationID) === String(operationId));
    const withdrewSupplierIds = new Set(retraits.map((r) => String(r.SupplierID)));
    const suppliers = store.suppliers.filter((s) => withdrewSupplierIds.has(String(s.Id)) || withdrewSupplierIds.has(String(s.id)));
    return {
      success: true,
      evaluations,
      operation: op,
      lots: operationLots(operationId),
      suppliers,
    };
  },
  addEvaluation: (body) => {
    const evaluation = {
      Id: generateId(),
      IdSession: body.IdSession,
      IdOperation: body.IdOperation,
      IdLot: body.IdLot,
      IdSupplier: body.IdSupplier,
      ScoreAdministrative: body.ScoreAdministrative,
      ScoreTechnique: body.ScoreTechnique,
      ScoreFinancier: body.ScoreFinancier,
      FinalNote: body.FinalNote,
      RejectionReason: body.RejectionReason,
    };
    getMockStore().evaluations.push(evaluation);
    return { success: true, code: 0 };
  },
  deleteEvaluation: (body) => {
    getMockStore().evaluations = getMockStore().evaluations.filter(
      (e) =>
        !(
          String(e.IdOperation) === String(body.IdOperation) &&
          String(e.IdSupplier) === String(body.IdSupplier) &&
          String(e.IdLot || '') === String(body.IdLot || '')
        )
    );
    return { success: true, code: 0 };
  },
};

const retraitHandlers = {
  create: (body) => {
    const exists = getMockStore().retraits.some(
      (r) =>
        String(r.SupplierID) === String(body.SupplierID) &&
        String(r.OperationID) === String(body.OperationID) &&
        r.NumeroRetrait === body.NumeroRetrait
    );
    if (exists) return { success: false, code: 1001, message: 'Numéro de retrait existe déjà' };
    const retrait = { Id: generateId(), ...body };
    getMockStore().retraits.push(retrait);
    return { success: true, data: retrait, message: 'Retrait créé' };
  },
  delete: (supplierId, operationId) => {
    getMockStore().retraits = getMockStore().retraits.filter(
      (r) =>
        !(String(r.SupplierID) === String(supplierId) && String(r.OperationID) === String(operationId))
    );
    return { success: true, code: 0, message: 'Retrait supprimé' };
  },
  retraitsWithSpecs: (annonceID) => {
    const ann = getMockStore().annonces.find((a) => String(a.Id) === String(annonceID));
    const opId = ann?.Id_Operation;
    const data = getMockStore().retraits
      .filter((r) => String(r.OperationID) === String(opId))
      .map((r) => {
        const supplier = findSupplier(r.SupplierID);
        return { 
          ...r, 
          supplierName: supplier?.Nom || '', 
          supplierEmail: supplier?.Email || '',
          Nom: supplier?.Nom || '',
          Email: supplier?.Email || '',
          Telephone: supplier?.Telephone || ''
        };
      });
    return { success: true, data };
  },
  suppliersWithOps: (adminId) => {
    const suppliers = filterByAdmin(getMockStore().suppliers, adminId, 'adminId');
    const data = suppliers.map((s) => ({
      ...s,
      operations: filterByAdmin(getMockStore().operations, adminId, 'adminID'),
    }));
    return { success: true, data };
  },
};

const budgetHandlers = {
  insertEngagement: (body) => {
    const id = generateId();
    const engagement = {
      EngagementID: id,
      operationId: body.operationId,
      lotId: body.lotId,
      partitionId: body.partitionId,
      reference: body.reference,
      date: body.date,
      amount: Number(body.amount),
      type: body.type === 'CREDIT' || body.type === 2 ? 2 : 1,
      reason: body.reason,
      description: body.reason,
      status: 1,
      adminId: body.adminId,
    };
    getMockStore().engagements.push(engagement);
    return { success: true, code: 0, engagementId: id };
  },
  selectByOperation: (operationId) => {
    const store = getMockStore();
    const data = [];
    store.engagements
      .filter((e) => String(e.operationId) === String(operationId))
      .forEach((eng) => {
        const partition = store.apPartitions.find((p) => String(p.Id) === String(eng.partitionId));
        const row = {
          EngagementID: eng.EngagementID,
          EngagementDate: eng.date,
          Referece: eng.reference,
          Amount: eng.amount,
          Type: eng.type,
          EngagementStatus: eng.status,
          LotID: eng.lotId,
          PartitionID: eng.partitionId,
          Description: eng.description,
          TravauxTypeLabel: partition ? TravauxTypeMap[partition.travauxType] : '—',
        };
        data.push(row);
        const payment = store.payments.find((p) => String(p.engagementId) === String(eng.EngagementID));
        if (payment) {
          data[data.length - 1] = {
            ...row,
            PaymentID: payment.id,
            PaymentDate: payment.date,
            PaymentStatus: payment.status,
            RelatedEngagementReference: eng.reference,
            RelatedEngagementType: eng.type,
          };
        }
      });
    store.payments
      .filter((p) => {
        const eng = store.engagements.find((e) => String(e.EngagementID) === String(p.engagementId));
        return eng && String(eng.operationId) === String(operationId);
      })
      .forEach((payment) => {
        if (!data.some((d) => d.PaymentID === payment.id)) {
          const eng = store.engagements.find((e) => String(e.EngagementID) === String(payment.engagementId));
          data.push({
            EngagementID: eng?.EngagementID,
            PaymentID: payment.id,
            PaymentDate: payment.date,
            PaymentStatus: payment.status,
            Amount: eng?.amount,
            Referece: eng?.reference,
            PartitionID: eng?.partitionId,
            RelatedEngagementReference: eng?.reference,
            RelatedEngagementType: eng?.type,
          });
        }
      });
    return { success: true, data };
  },
  validateEngagement: (engagementId, body) => {
    const eng = getMockStore().engagements.find((e) => String(e.EngagementID) === String(engagementId));
    if (!eng) return { success: false };
    eng.status = 2;
    eng.visaCf = body?.visaCf;
    eng.dateVisa = body?.dateVisa;
    const paymentId = generateId();
    getMockStore().payments.push({
      id: paymentId,
      engagementId,
      date: null,
      status: 1,
      operationId: eng.operationId,
    });
    return { success: true, code: 0 };
  },
  uploadEngagementPDF: () => ({ success: true }),
  uploadPaymentPDF: () => ({ success: true }),
};

const paymentHandlers = {
  getAll: () => ({ success: true, payments: getMockStore().payments }),
  update: (paymentId, body) => {
    const p = getMockStore().payments.find((x) => String(x.id) === String(paymentId));
    if (!p) return { success: false };
    p.date = body.date;
    p.status = 2;
    return { success: true, code: 0 };
  },
};

const adminHandlers = {
  getAll: () => ({ success: true, admins: getMockStore().admins }),
  create: (body) => {
    const admin = {
      id: generateId(),
      email: body.email,
      nom_prenom: body.nom_prenom,
      function: body.function,
      role: 1,
      state: 1,
    };
    getMockStore().admins.push(admin);
    return { success: true, admin };
  },
  toggleState: (id, body) => {
    const a = getMockStore().admins.find((x) => String(x.id) === String(id));
    if (a) a.state = body.newState;
    return { success: true };
  },
  delete: (id) => {
    getMockStore().admins = getMockStore().admins.filter((a) => String(a.id) !== String(id));
    return { success: true };
  },
};

const documentHandlers = {
  getBySessionAndOperation: (sessionId, operationId) => {
    const documents = getMockStore().documents.filter(
      (d) => String(d.SessionID) === String(sessionId) && String(d.OperationID) === String(operationId)
    );
    return { success: true, documents };
  },
  getBySession: (sessionId) => {
    const documents = getMockStore().documents.filter((d) => String(d.SessionID) === String(sessionId));
    return { success: true, documents };
  },
  upload: () => ({ success: true }),
};

export const mockApiRequest = async (url, method, body = null) => {
  await delay();
  const parsed = parseUrl(url);
  const path = parsed.pathname;
  const m = method.toUpperCase();

  // Supplier
  if (path === '/api/supplier/getAllSuppliers') {
    return supplierHandlers.getAll(getQuery(parsed, 'adminID'));
  }
  if (path === '/api/supplier/addSupplier' && m === 'POST') return supplierHandlers.add(body);
  if (path === '/api/supplier/updateSupplier' && m === 'PUT') return supplierHandlers.update(body);
  if (path.startsWith('/api/supplier/deleteSupplier/')) return supplierHandlers.delete(path.split('/').pop());
  if (path === '/api/supplier/insertSelectedSupplier' && m === 'POST') return supplierHandlers.insertSelected(body);
  if (path === '/api/supplier/getTopSupplier') {
    return supplierHandlers.getTop(getQuery(parsed, 'lotId'), getQuery(parsed, 'operationId'));
  }
  if (path.startsWith('/api/supplier/getSupplierById/')) {
    return supplierHandlers.getById(path.split('/').pop());
  }

  // Operations
  if (path === '/api/opr/AllOperations') return { data: operationHandlers.getAll(getQuery(parsed, 'adminID')).data };
  if (path === '/api/opr/addOperation' && m === 'POST') return operationHandlers.add(body);
  if (path === '/api/opr/updateOperation' && m === 'PUT') return operationHandlers.update(body);
  if (path.startsWith('/api/opr/deleteOperation/')) return operationHandlers.delete(path.split('/').pop());
  if (path.startsWith('/api/opr/manageArchiveOperation/')) return operationHandlers.manageArchive(path.split('/').pop());
  if (path.startsWith('/api/opr/operationById/')) return operationHandlers.getById(path.split('/').pop());
  if (path.startsWith('/api/opr/validateOperation/')) return operationHandlers.validate(path.split('/').pop());
  if (path.startsWith('/api/opr/updateOperationState/')) return operationHandlers.updateState(path.split('/').pop(), body);
  if (path === '/api/opr/get-by-date' && m === 'POST') return operationHandlers.getByDate(body);
  if (path === '/api/opr/get-operationBudgetManagement') {
    return operationHandlers.getBudgetList(getQuery(parsed, 'adminId'));
  }

  // Annonces
  if (path === '/api/ann/AllAnnonces') {
    return annonceHandlers.getAll(getQuery(parsed, 'adminID'), getQuery(parsed, 'operationID'));
  }
  if (path === '/api/ann/addAnnonce' && m === 'POST') return annonceHandlers.add(body);
  if (path === '/api/ann/updateAnnonce' && m === 'PUT') return annonceHandlers.update(body);
  if (path.startsWith('/api/ann/deleteAnnonce/')) return annonceHandlers.delete(path.split('/').pop());
  if (path.startsWith('/api/ann/validateAnnonce/')) {
    const annonceId = decodeURIComponent(path.slice('/api/ann/validateAnnonce/'.length));
    return annonceHandlers.validate(annonceId);
  }
  if (path.startsWith('/api/ann/endReception/')) {
    const annonceId = decodeURIComponent(path.slice('/api/ann/endReception/'.length));
    return annonceHandlers.endReception(annonceId);
  }

  // Lots
  if (path === '/api/lot/addLot' && m === 'POST') return lotHandlers.add(body);
  if (path.startsWith('/api/lot/updateLot/')) return lotHandlers.update(path.split('/').pop(), body);
  if (path.startsWith('/api/lot/deleteLot/')) return lotHandlers.delete(path.split('/').pop());

  // AP Partitions
  if (path.startsWith('/api/apPartitions/getPartitonsByOperationId/')) {
    return apHandlers.getByOperation(path.split('/').pop());
  }
  if (path === '/api/apPartitions/createApPartition' && m === 'POST') return apHandlers.create(body);
  if (path === '/api/apPartitions/updateApPartition' && m === 'PUT') return apHandlers.update(body);
  if (path.startsWith('/api/apPartitions/deleteApPartiton/')) return apHandlers.delete(path.split('/').pop());
  if (path.includes('/api/apPartitions/') && path.endsWith('/details')) {
    const parts = path.split('/');
    const partitionId = parts[parts.indexOf('apPartitions') + 1];
    return apHandlers.details(partitionId, getQuery(parsed, 'operationId'));
  }

  // Commission
  if (path === '/api/cm/AllCommissionMembers') return commissionHandlers.getAll(getQuery(parsed, 'adminId'));
  if (path === '/api/cm/addCommissionMember' && m === 'POST') return commissionHandlers.add(body);
  if (path.startsWith('/api/cm/deleteCommissionMember/')) return commissionHandlers.delete(path.split('/').pop());
  if (path.startsWith('/api/cm/updateCommissionMember/')) {
    const parts = path.split('/');
    return commissionHandlers.update(parts[parts.length - 1], body);
  }

  // Evaluation
  if (path.startsWith('/api/eval/sessions/') && path.includes('/operations/') && m === 'DELETE') {
    const parts = path.split('/');
    const sessionIdx = parts.indexOf('sessions') + 1;
    return evalHandlers.deleteOpFromSession(parts[sessionIdx], parts[parts.length - 1]);
  }
  if (path.startsWith('/api/eval/sessions/') && m === 'GET') {
    const adminId = path.split('/').pop();
    return evalHandlers.getSessions(adminId);
  }
  if (path === '/api/eval/addSession' && m === 'POST') return evalHandlers.addSession(body);
  if (path.startsWith('/api/eval/membersBySession/')) {
    return evalHandlers.membersBySession(path.split('/').pop());
  }
  if (path.startsWith('/api/eval/evaluationsByOperation/')) {
    return evalHandlers.evaluationsByOperation(path.split('/').pop());
  }
  if (path === '/api/eval/addEvaluation' && m === 'POST') return evalHandlers.addEvaluation(body);
  if (path === '/api/eval/deleteEvaluation' && m === 'POST') return evalHandlers.deleteEvaluation(body);
  if (path === '/api/eval/presence' && m === 'POST') return evalHandlers.presence(body);
  if (path.startsWith('/api/eval/closeSession/')) return evalHandlers.closeSession(path.split('/').pop());

  // Retrait
  if (path === '/api/retrait/createRetrait' && m === 'POST') return retraitHandlers.create(body);
  if (path === '/api/retrait/deleteRetrait' && m === 'DELETE') {
    return retraitHandlers.delete(getQuery(parsed, 'supplierId'), getQuery(parsed, 'operationId'));
  }
  if (path === '/api/retrait/retraitsWithSpecs') {
    return retraitHandlers.retraitsWithSpecs(getQuery(parsed, 'annonceID'));
  }
  if (path.startsWith('/api/retrait/suppliers/')) {
    return retraitHandlers.suppliersWithOps(path.split('/').pop());
  }

  // Budget
  if (path === '/api/budget/insertEngagement' && m === 'POST') return budgetHandlers.insertEngagement(body);
  if (path.startsWith('/api/budget/selectEngagementsAndPaymentByOperation/')) {
    return budgetHandlers.selectByOperation(decodeURIComponent(path.split('/').pop()));
  }
  if (path.startsWith('/api/budget/validateEngagement/')) {
    return budgetHandlers.validateEngagement(path.split('/').pop(), body);
  }
  if (path.startsWith('/api/budget/uploadEngagementPDF/')) return budgetHandlers.uploadEngagementPDF();

  // Payment
  if (path === '/api/payment/getAllPayments') return paymentHandlers.getAll();
  if (path.startsWith('/api/payment/updatePayment/')) return paymentHandlers.update(path.split('/').pop(), body);
  if (path.startsWith('/api/payment/uploadPDF/')) return paymentHandlers.uploadPaymentPDF();

  // Admin
  if (path === '/api/admin/admins' && m === 'GET') return adminHandlers.getAll();
  if (path === '/api/admin/admins' && m === 'POST') return adminHandlers.create(body);
  if (path.includes('/api/admin/admins/') && path.endsWith('/state') && m === 'PATCH') {
    const id = path.split('/')[path.split('/').length - 2];
    return adminHandlers.toggleState(id, body);
  }
  if (path.startsWith('/api/admin/admins/') && m === 'DELETE') {
    return adminHandlers.delete(path.split('/').pop());
  }

  // Documents
  if (path.startsWith('/api/doc/session/') && path.includes('/operation/')) {
    const parts = path.split('/');
    const sessionIdx = parts.indexOf('session') + 1;
    const opIdx = parts.indexOf('operation') + 1;
    return documentHandlers.getBySessionAndOperation(parts[sessionIdx], parts[opIdx]);
  }
  if (path.startsWith('/api/doc/session/')) {
    return documentHandlers.getBySession(path.split('/').pop());
  }
  if (path === '/api/doc/upload' && m === 'POST') return documentHandlers.upload();

  console.warn(`[mockApi] Unhandled route: ${m} ${path}`);
  return { success: false, message: `Route non mockée: ${path}`, code: 404 };
};
