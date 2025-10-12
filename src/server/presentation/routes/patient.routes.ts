import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new PatientController();

router.post('/', authenticate, validateRequest, (req, res) =>
    controller.create(req, res)
);

router.get('/:id', authenticate, (req, res) =>
    controller.getById(req, res)
);

router.get('/phone/:phoneNumber', authenticate, (req, res) =>
    controller.getByPhone(req, res)
);

router.put('/:id', authenticate, validateRequest, (req, res) =>
    controller.update(req, res)
);

router.get('/', authenticate, (req, res) =>
    controller.list(req, res)
);

export default router;