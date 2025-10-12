import { Request, Response } from 'express';
import { container } from '../../infrastructure/container';
import { logger } from '../../infrastructure/config/logger';

export class AnalyticsController {
    async getCallAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query.startDate
                ? new Date(req.query.startDate as string)
                : undefined;
            const endDate = req.query.endDate
                ? new Date(req.query.endDate as string)
                : undefined;

            const result = await container.getCallAnalytics.execute(
                startDate,
                endDate
            );

            if (result.isFailure) {
                res.status(400).json({ error: result.error.message });
                return;
            }

            res.json(result.value);
        } catch (error: any) {
            logger.error('Error fetching analytics', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getSystemHealth(req: Request, res: Response): Promise<void> {
        try {
            const health = {
                status: 'healthy',
                timestamp: new Date(),
                services: {
                    database: 'up',
                    ai: 'up',
                    twilio: 'up',
                    vectorDb: 'up'
                },
                uptime: process.uptime(),
                memory: process.memoryUsage()
            };

            res.json(health);
        } catch (error: any) {
            logger.error('Error fetching health', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}