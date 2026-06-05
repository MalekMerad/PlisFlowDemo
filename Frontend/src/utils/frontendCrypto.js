export const hashPasswordFrontend = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 50);
};

export const obfuscateEmail = (email) => {
    return btoa(encodeURIComponent(email));
};

export const deobfuscateEmail = (obfuscated) => {
    try {
        return decodeURIComponent(atob(obfuscated));
    } catch {
        return null;
    }
};