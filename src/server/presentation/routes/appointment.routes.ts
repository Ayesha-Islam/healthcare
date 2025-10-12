import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const controller = new AppointmentController();

router.post('/', authenticate, validateRequest, (req, res) =>
    controller.create(req, res)
);

router.get('/:id', authenticate, (req, res) =>
    controller.getById(req, res)
);

router.get('/patient/:patientId', authenticate, (req, res) =>
    controller.getByPatient(req, res)
);

router.get('/upcoming', authenticate, (req, res) =>
    controller.getUpcoming(req, res)
);

router.put('/:id', authenticate, validateRequest, (req, res) =>
    controller.update(req, res)
);

router.delete('/:id', authenticate, (req, res) =>
    controller.cancel(req, res)
);

export default router;