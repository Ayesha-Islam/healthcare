import { Request, Response, NextFunction } from 'express';
import { config } from '../../infrastructure/config/env';
import { logger } from '../../infrastructure/config/logger';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    if (config.isDevelopment) {
        next();
        return;
    }


    logger.warn('Unauthorized access attempt', { ip: req.ip });
    res.status(401).json({ error: 'Unauthorized' });
    return;

}