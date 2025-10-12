import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/config/logger';
import { config } from '../../infrastructure/config/env';

interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    stack?: string;
    timestamp: string;
    path: string;
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    const errorResponse: ErrorResponse = {
        error: err.name || 'Error',
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
    };

    // Include stack trace in development
    if (config.isDevelopment) {
        errorResponse.stack = err.stack;
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        errorResponse.statusCode = 400;
        errorResponse.error = 'Validation Error';
    }

    if (err.name === 'UnauthorizedError') {
        errorResponse.statusCode = 401;
        errorResponse.error = 'Unauthorized';
    }

    if (err.code === 'P2002') {
        // Prisma unique constraint error
        errorResponse.statusCode = 409;
        errorResponse.error = 'Conflict';
        errorResponse.message = 'Resource already exists';
    }

    if (err.code === 'P2025') {
        // Prisma record not found
        errorResponse.statusCode = 404;
        errorResponse.error = 'Not Found';
        errorResponse.message = 'Resource not found';
    }

    res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};