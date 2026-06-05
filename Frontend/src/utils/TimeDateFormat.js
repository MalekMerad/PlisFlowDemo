function formatDate(dateString, locale = 'fr-FR') {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (e) {
        return 'N/A';
    }
}

function formatTime(timeString, locale = 'fr-FR') {
    if (!timeString) return '';
    try {
        return new Date(timeString).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return '';
    }
}

export { formatDate, formatTime };