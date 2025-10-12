export class DateUtils {
    static formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    static formatDateTime(date: Date): string {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    static addMinutes(date: Date, minutes: number): Date {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    static isWeekday(date: Date): boolean {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    }

    static isFuture(date: Date): boolean {
        return date > new Date();
    }

    static getDayOfWeek(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }
}