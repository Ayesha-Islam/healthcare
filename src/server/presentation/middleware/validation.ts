import { Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/container';
import { ValidationService } from '@/server/application/services/ValidationService';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
    try {
        const validation = container.validationService;

        if (req.body.phoneNumber) {
            ValidationService.validatePhoneNumber(req.body.phoneNumber);
        }

        if (req.body.email) {
            ValidationService.validateEmail(req.body.email);
        }

        if (req.body.dateOfBirth) {
            ValidationService.validateDateOfBirth(new Date(req.body.dateOfBirth));
        }

        if (req.body.dateTime) {
            ValidationService.validateAppointmentDate(new Date(req.body.dateTime));
        }

        next();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}