export const formatDZD = (value) => {
    const numericValue = Number(String(value || 0).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(numericValue)) {
        return '0.00 DZD';
    }
    return `${numericValue.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} DZD`;
};