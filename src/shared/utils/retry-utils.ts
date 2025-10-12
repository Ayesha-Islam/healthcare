export class RetryUtils {
    static async withRetry<T>(
        fn: () => Promise<T>,
        options: {
            maxAttempts?: number;
            delayMs?: number;
            backoff?: boolean;
        } = {}
    ): Promise<T> {
        const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;
        let lastError: Error;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                if (attempt < maxAttempts) {
                    const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
                    await this.sleep(delay);
                }
            }
        }

        throw lastError!;
    }

    static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}