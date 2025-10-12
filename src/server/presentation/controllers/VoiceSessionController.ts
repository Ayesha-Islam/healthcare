import { Request, Response } from 'express';
import { container } from '../../infrastructure/container';
import { logger } from '../../infrastructure/config/logger';

export class VoiceSessionController {
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const session = await container.voiceSessionRepo.findById(req.params.id);

            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }

            res.json(session);
        } catch (error: any) {
            logger.error('Error fetching session', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getByCallSid(req: Request, res: Response): Promise<void> {
        try {
            const session = await container.voiceSessionRepo.findByCallSid(
                req.params.callSid
            );

            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }

            res.json(session);
        } catch (error: any) {
            logger.error('Error fetching session by CallSid', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getByPatient(req: Request, res: Response): Promise<void> {
        try {
            const sessions = await container.voiceSessionRepo.findByPatientId(
                req.params.patientId
            );
            res.json(sessions);
        } catch (error: any) {
            logger.error('Error fetching patient sessions', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getRecent(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const sessions = await container.voiceSessionRepo.findRecent(limit);
            res.json(sessions);
        } catch (error: any) {
            logger.error('Error fetching recent sessions', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}