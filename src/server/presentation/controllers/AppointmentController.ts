import { Request, Response } from 'express';
import { container } from '../../infrastructure/container';
import { logger } from '../../infrastructure/config/logger';

export class AppointmentController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const result = await container.bookAppointment.execute(req.body);

            if (result.isFailure) {
                res.status(400).json({ error: result.error.message });
                return;
            }

            res.status(201).json(result.value);
        } catch (error: any) {
            logger.error('Error creating appointment', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const appointment = await container.appointmentRepo.findById(req.params.id);

            if (!appointment) {
                res.status(404).json({ error: 'Appointment not found' });
                return;
            }

            res.json(appointment);
        } catch (error: any) {
            logger.error('Error fetching appointment', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getByPatient(req: Request, res: Response): Promise<void> {
        try {
            const appointments = await container.appointmentRepo.findByPatientId(
                req.params.patientId
            );
            res.json(appointments);
        } catch (error: any) {
            logger.error('Error fetching patient appointments', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getUpcoming(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const appointments = await container.appointmentRepo.findUpcoming(limit);
            res.json(appointments);
        } catch (error: any) {
            logger.error('Error fetching upcoming appointments', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const appointment = await container.appointmentRepo.update(
                req.params.id,
                req.body
            );
            res.json(appointment);
        } catch (error: any) {
            logger.error('Error updating appointment', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async cancel(req: Request, res: Response): Promise<void> {
        try {
            await container.schedulingService.cancelAppointment(req.params.id);
            res.json({ message: 'Appointment cancelled successfully' });
        } catch (error: any) {
            logger.error('Error cancelling appointment', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}