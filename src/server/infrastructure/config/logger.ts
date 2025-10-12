type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    data?: any;
}

class Logger {
    private formatMessage(level: LogLevel, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const emoji = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '🐛',
        }[level];

        let logMessage = `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`;

        if (data) {
            logMessage += `\n${JSON.stringify(data, null, 2)}`;
        }

        return logMessage;
    }

    info(message: string, data?: any): void {
        console.log(this.formatMessage('info', message, data));
    }

    warn(message: string, data?: any): void {
        console.warn(this.formatMessage('warn', message, data));
    }

    error(message: string, data?: any): void {
        console.error(this.formatMessage('error', message, data));
    }

    debug(message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('debug', message, data));
        }
    }

    // HTTP request logging
    http(method: string, url: string, statusCode: number, duration: number): void {
        const color = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';
        console.log(`${color} ${method} ${url} - ${statusCode} (${duration}ms)`);
    }
}

export const logger = new Logger();