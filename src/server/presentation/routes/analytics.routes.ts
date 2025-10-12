import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new AnalyticsController();

router.get('/calls', authenticate, (req, res) =>
    controller.getCallAnalytics(req, res)
);

router.get('/health', authenticate, (req, res) =>
    controller.getSystemHealth(req, res)
);

export default router;