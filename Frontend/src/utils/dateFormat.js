export function parseDateSafe(value) {
    if (!value) return null;

    // Handle ISO datetime: keep only yyyy-mm-dd
    if (typeof value === "string" && value.includes("T")) {
        value = value.split("T")[0];
    }

    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d); // no timezone shift
    }

    // dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [d, m, y] = value.split("/").map(Number);
        return new Date(y, m - 1, d);
    }

    return null;
}

export function formatDateInput(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function addDays(baseDate, days) {
    if (!baseDate || days === "" || days === null) return "";

    const date = parseDateSafe(baseDate);
    if (!date) return "";

    date.setDate(date.getDate() + Number(days));
    return formatDateInput(date);
}
