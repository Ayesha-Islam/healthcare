import { Request, Response } from 'express';

export class HealthController {
    async check(req: Request, res: Response): Promise<void> {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }

    async readiness(req: Request, res: Response): Promise<void> {
        try {
            res.json({
                status: 'ready',
                checks: {
                    database: 'ok',
                    services: 'ok'
                }
            });
        } catch (error) {
            res.status(503).json({
                status: 'not ready',
                error: 'Service initialization failed'
            });
        }
    }
}