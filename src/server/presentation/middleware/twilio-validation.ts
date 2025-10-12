import { Request, Response, NextFunction } from 'express';
import { validateTwilioRequest } from '../../infrastructure/config/twilio-config';
import { logger } from '../../infrastructure/config/logger';

export function validateTwilioWebhook(req: Request, res: Response, next: NextFunction): void {
    const signature = req.headers['x-twilio-signature'] as string;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    if (!validateTwilioRequest(signature, url, req.body)) {
        logger.warn('Invalid Twilio signature', { url });
        res.status(403).send('Forbidden');
        return;
    }

    next();
}