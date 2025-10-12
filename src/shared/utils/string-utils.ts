export class StringUtils {
    static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static capitalizeWords(str: string): string {
        return str.split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }

    static truncate(str: string, length: number): string {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    static sanitize(str: string): string {
        return str.trim().replace(/[<>]/g, '');
    }

    static generateId(prefix: string = ''): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        return `${prefix}${timestamp}${random}`;
    }

    static slugify(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}