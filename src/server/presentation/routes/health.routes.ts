import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const controller = new HealthController();

router.get('/', (req, res) => controller.check(req, res));
router.get('/ready', (req, res) => controller.readiness(req, res));

export default router;