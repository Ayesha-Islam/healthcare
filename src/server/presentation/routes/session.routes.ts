import { Router } from 'express';
import { VoiceSessionController } from '../controllers/VoiceSessionController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new VoiceSessionController();

router.get('/:id', authenticate, (req, res) =>
    controller.getById(req, res)
);

router.get('/call/:callSid', authenticate, (req, res) =>
    controller.getByCallSid(req, res)
);

router.get('/patient/:patientId', authenticate, (req, res) =>
    controller.getByPatient(req, res)
);

router.get('/', authenticate, (req, res) =>
    controller.getRecent(req, res)
);

export default router;