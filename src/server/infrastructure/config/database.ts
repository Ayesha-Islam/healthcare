import { PrismaClient } from "@/db/generated/client";

// Global variable to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
    if (prismaInstance) {
        return prismaInstance;
    }

    if (globalForPrisma.prisma) {
        prismaInstance = globalForPrisma.prisma;
        return prismaInstance;
    }

    prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
    });

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance;
    }

    if (process.env.NODE_ENV === 'production') {
        const cleanup = async () => {
            if (prismaInstance) {
                await prismaInstance.$disconnect();
            }
        };

        process.on('beforeExit', cleanup);
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }

    return prismaInstance;
}

// Optional: Export for direct use if needed
export const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        const client = getPrismaClient();
        const value = client[prop as keyof PrismaClient];

        // Bind methods to the client instance
        if (typeof value === 'function') {
            return value.bind(client);
        }

        return value;
    }
});