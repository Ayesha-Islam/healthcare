export class PhoneUtils {
    // Format phone number to international format
    static format(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 11 && cleaned.startsWith('03')) {
            return `+92${cleaned.substring(1)}`;
        }

        if (cleaned.length === 10 && cleaned.startsWith('3')) {
            return `+92${cleaned}`;
        }

        if (cleaned.length === 12 && cleaned.startsWith('92')) {
            return `+${cleaned}`;
        }

        // US/Generic format (10 digits)
        if (cleaned.length === 10) {
            return `+1${cleaned}`;
        }

        // US with country code
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+${cleaned}`;
        }

        // Return with + if not already present
        return cleaned.startsWith('+') ? phone : `+${cleaned}`;
    }

    // Normalize phone number (remove formatting)
    static normalize(phone: string): string {
        return phone.replace(/[\s\-\(\)]/g, '');
    }

    // Validate phone number
    static isValid(phone: string): boolean {
        const normalized = this.normalize(phone).replace(/^\+/, '');

        // Pakistani local format: 03xxxxxxxxx (11 digits starting with 03)
        if (/^03\d{9}$/.test(normalized)) {
            return true;
        }

        // Pakistani without leading 0: 3xxxxxxxxx (10 digits starting with 3)
        if (/^3\d{9}$/.test(normalized)) {
            return true;
        }

        // Pakistani international: 923xxxxxxxxx (12 digits)
        if (/^923\d{9}$/.test(normalized)) {
            return true;
        }

        // International format (10-15 digits)
        if (/^\d{10,15}$/.test(normalized)) {
            return true;
        }

        return false;
    }

    // Mask phone number
    static mask(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length >= 10) {
            return `***-***-${cleaned.slice(-4)}`;
        }

        return '***-****';
    }

    // Check if Pakistani number
    static isPakistaniNumber(phone: string): boolean {
        const normalized = this.normalize(phone).replace(/^\+/, '');

        // Check for Pakistani patterns
        return (
            /^03\d{9}$/.test(normalized) ||
            /^3\d{9}$/.test(normalized) ||
            /^923\d{9}$/.test(normalized)
        );
    }

    // Convert to local format
    static toLocalFormat(phone: string): string {
        const normalized = this.normalize(phone).replace(/^\+/, '');

        // If already in local format
        if (/^0\d+$/.test(normalized)) {
            return normalized;
        }

        // International Pakistani format -> Local
        if (normalized.startsWith('92')) {
            return `0${normalized.substring(2)}`;
        }

        // Without leading 0 -> Add 0
        if (/^3\d{9}$/.test(normalized)) {
            return `0${normalized}`;
        }

        return normalized;
    }
}