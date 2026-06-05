export const getBudgetTypeLabel = (code) => {
    switch (code) {
        case 1: return "Equipement";
        case 2: return "Fonctionnement";
        case 3: return "Opérations Hors Budget";
        default: return "Inconnu";
    }
};

export const getModeAttribuationLabel = (code) => {
    switch (code) {
        case 1: return "Appel d'Offres Ouvert";
        case 2: return "Appel d'Offres Restreint";
        default: return "Inconnu";
    }
};

export const getTypeTravauxLabel = (code) => {
    switch (code) {
        case 1: return "Travaux";
        case 2: return "Prestations";
        case 3: return "Equipement";
        case 4: return "Etude";
        default: return "Inconnu";
    }
};

export const getStateLabel = (code) => {
    switch (code) {
        case 0: return "Terminée";
        case 1: return "Active";
        case -1: return "Supprimée";
        default: return "Inconnu";
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};