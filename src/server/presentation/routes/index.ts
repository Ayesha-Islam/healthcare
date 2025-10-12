import { Router } from 'express';
import twilioRoutes from './twilio.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';
import sessionRoutes from './session.routes';
import analyticsRoutes from './analytics.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/twilio', twilioRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/sessions', sessionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/health', healthRoutes);

router.get('/', (req, res) => {
    res.json({
        name: 'Healthcare Voice Assistant API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            patients: '/api/patients',
            appointments: '/api/appointments',
            sessions: '/api/sessions',
            twilio: '/api/twilio',
            analytics: '/api/analytics',
        },
        documentation: '/api/docs',
    });
});
export default router;