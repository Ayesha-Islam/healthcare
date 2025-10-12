import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    API_PORT: z.string().default('3001'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),

    // Database
    DATABASE_URL: z.string(),
    DIRECT_URL: z.string().optional(),

    // Twilio
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_PHONE_NUMBER: z.string().optional(),

    // AI Services
    GROQ_API_KEY: z.string(),

    // Vector Database
    CHROMA_URL: z.string().default('http://localhost:8000'),

    // Redis
    REDIS_URL: z.string().optional(),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
    API_KEYS: z.string().optional(),
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:');
            error.issues.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};

const env = parseEnv();

export const config = {
    env: env.NODE_ENV,
    port: parseInt(env.API_PORT, 10),
    frontendUrl: env.FRONTEND_URL,

    database: {
        url: env.DATABASE_URL,
        directUrl: env.DIRECT_URL,
    },

    twilio: {
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        phoneNumber: env.TWILIO_PHONE_NUMBER,
    },

    ai: {
        groqApiKey: env.GROQ_API_KEY,
    },

    chroma: {
        url: env.CHROMA_URL,
    },

    redis: {
        url: env.REDIS_URL,
    },

    rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
        maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    },

    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
};

export default config;