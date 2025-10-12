import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log request
    logger.debug(`Incoming ${req.method} request`, {
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Override res.send to capture response
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        logger.http(req.method, req.url, res.statusCode, duration);
        return originalSend.call(this, data);
    };

    next();
};