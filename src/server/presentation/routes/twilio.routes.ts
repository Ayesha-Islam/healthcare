import { Router } from 'express';
import { TwilioVoiceController } from '../controllers/TwilioVoiceController';
import { validateTwilioWebhook } from '../middleware/twilio-validation';

const router = Router();
const controller = new TwilioVoiceController();

router.post('/voice/incoming', validateTwilioWebhook, (req, res) =>
    controller.handleIncoming(req, res)
);

router.post('/voice/process', validateTwilioWebhook, (req, res) =>
    controller.processInput(req, res)
);

router.post('/voice/status', validateTwilioWebhook, (req, res) =>
    controller.handleStatus(req, res)
);

router.post('/voice/recording', validateTwilioWebhook, (req, res) =>
    controller.handleRecording(req, res)
);

export default router;