const regexFormats = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^0[5-7]\d{8}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    name: /^VISA-\d{4}\-\d{4}$/,
    address: /^[a-zA-Z0-9\s.,-]+$/,
    city: /^[a-zA-Z\s]+$/,
    state: /^[a-zA-Z\s]+$/,
    zip: /^[0-9]{5}$/,
    country: /^[a-zA-Z\s]+$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    time: /^\d{2}:\d{2}$/,
    datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    hex: /^#([0-9a-fA-F]{6})$/,
    creditCard: /^(\d{4}[- ]?){3}\d{4}$/,
    
    text: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s'-]{3,}$/,
    noRepeat: /^(?!.*(.)\1{3,}).*$/

};

export const validateText = (value) => {
    if (!value) return "Champ obligatoire";

    if (!regexFormats.text.test(value)) {
        return "Texte invalide (FR/EN, min 3 caractères)";
    }

    if (!regexFormats.noRepeat.test(value)) {
        return "Répétition excessive de caractères";
    }

    return "";
};

export default regexFormats;