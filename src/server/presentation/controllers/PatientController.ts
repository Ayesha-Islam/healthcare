import { Request, Response } from 'express';
import { container } from '../../infrastructure/container';
import { logger } from '../../infrastructure/config/logger';

export class PatientController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const result = await container.registerPatient.execute(req.body);

            if (result.isFailure) {
                res.status(400).json({ error: result.error.message });
                return;
            }

            res.status(201).json(result.value);
        } catch (error: any) {
            logger.error('Error creating patient', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const patient = await container.patientRepo.findById(req.params.id);

            if (!patient) {
                res.status(404).json({ error: 'Patient not found' });
                return;
            }

            res.json(patient);
        } catch (error: any) {
            logger.error('Error fetching patient', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getByPhone(req: Request, res: Response): Promise<void> {
        try {
            const patient = await container.patientRepo.findByPhoneNumber(
                req.params.phoneNumber
            );

            if (!patient) {
                res.status(404).json({ error: 'Patient not found' });
                return;
            }

            res.json(patient);
        } catch (error: any) {
            logger.error('Error fetching patient by phone', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const patient = await container.patientRepo.update(
                req.params.id,
                req.body
            );
            res.json(patient);
        } catch (error: any) {
            logger.error('Error updating patient', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;

            const patients = await container.patientRepo.findAll(limit, offset);
            res.json(patients);
        } catch (error: any) {
            logger.error('Error listing patients', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}