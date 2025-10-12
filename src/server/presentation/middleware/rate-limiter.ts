import rateLimit from 'express-rate-limit';
import { config } from '../../infrastructure/config/env';

export const rateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health' || req.path === '/api/health',
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        error: 'Too many authentication attempts',
        message: 'Please try again after 15 minutes.',
    },
    skipSuccessfulRequests: true,
});

// Stricter rate limiter for Twilio webhooks
export const twilioRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: 'Too many webhook requests',
        message: 'Webhook rate limit exceeded.',
    },
});