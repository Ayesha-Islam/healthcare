export class ValidationUtils {
    static isEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static isPhoneNumber(phone: string): boolean {
        const cleaned = phone.replace(/\D/g, '');

        return (
            (cleaned.length === 12 && cleaned.startsWith('92')) ||
            (cleaned.length === 11 && cleaned.startsWith('030')) ||
            (cleaned.length === 10 && cleaned.startsWith('3'))
        );
    }

    static isDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }

    static isUUID(str: string): boolean {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(str);
    }

    static isEmpty(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    static isInRange(value: number, min: number, max: number): boolean {
        return value >= min && value <= max;
    }
}