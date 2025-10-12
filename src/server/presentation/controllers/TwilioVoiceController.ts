import { Request, Response } from 'express';
import { container } from '../../infrastructure/container';
import { buildTwiMLResponse } from '../../infrastructure/config/twilio-config';
import { logger } from '../../infrastructure/config/logger';
import { SessionStatus } from '@/server/domain/entities/VoiceSession';

export class TwilioVoiceController {
    async handleIncoming(req: Request, res: Response): Promise<void> {
        try {
            const { CallSid, From } = req.body;

            logger.info('Incoming call', { CallSid, From });

            const result = await container.handleIncomingCall.execute(CallSid, From);

            if (result.isFailure) {
                logger.error('Failed to handle incoming call', result.error);
                const twiml = buildTwiMLResponse(
                    'We are experiencing technical difficulties. Please try again later.',
                    { hangup: true }
                );
                res.type('text/xml').send(twiml);
                return;
            }

            const session = result.value;
            const greeting = session.patientId
                ? 'Welcome back! How can I help you today?'
                : 'Thank you for calling. To better assist you, may I have your full name?';

            const twiml = buildTwiMLResponse(greeting, {
                gather: true,
                redirect: '/api/twilio/voice/process'
            });

            res.type('text/xml').send(twiml);
        } catch (error: any) {
            logger.error('Error in handleIncoming', error);
            res.status(500).send('Internal server error');
        }
    }

    async processInput(req: Request, res: Response): Promise<void> {
        try {
            const { CallSid, SpeechResult } = req.body;

            if (!SpeechResult) {
                const twiml = buildTwiMLResponse(
                    "I didn't catch that. Could you please repeat?",
                    { gather: true, redirect: '/api/twilio/voice/process' }
                );
                res.type('text/xml').send(twiml);
                return;
            }

            logger.info('Processing voice input', { CallSid, SpeechResult });

            const session = await container.voiceSessionRepo.findByCallSid(CallSid);
            if (!session) {
                const twiml = buildTwiMLResponse(
                    'Session not found. Please call again.',
                    { hangup: true }
                );
                res.type('text/xml').send(twiml);
                return;
            }

            const result = await container.processVoiceInput.execute(
                session.id,
                SpeechResult
            );

            if (result.isFailure) {
                const twiml = buildTwiMLResponse(
                    'I apologize, but I encountered an error. Let me transfer you to a staff member.',
                    { hangup: false }
                );
                res.type('text/xml').send(twiml);
                return;
            }

            const { response, shouldTransfer, transferReason } = result.value;

            if (shouldTransfer) {
                await this.handleTransfer(CallSid, session.id, transferReason || 'USER_REQUEST', res);
                return;
            }

            const twiml = buildTwiMLResponse(response, {
                gather: true,
                redirect: '/api/twilio/voice/process'
            });

            res.type('text/xml').send(twiml);
        } catch (error: any) {
            logger.error('Error in processInput', error);
            res.status(500).send('Internal server error');
        }
    }

    async handleStatus(req: Request, res: Response): Promise<void> {
        try {
            const { CallSid, CallStatus, CallDuration } = req.body;

            logger.info('Call status update', { CallSid, CallStatus, CallDuration });

            const session = await container.voiceSessionRepo.findByCallSid(CallSid);

            if (session && CallStatus === 'completed') {
                await container.voiceSessionRepo.update(session.id, {
                    status: SessionStatus.COMPLETED,
                    duration: parseInt(CallDuration || '0', 10),
                    endedAt: new Date()
                });
            }

            res.sendStatus(200);
        } catch (error: any) {
            logger.error('Error in handleStatus', error);
            res.sendStatus(500);
        }
    }

    async handleRecording(req: Request, res: Response): Promise<void> {
        try {
            const { CallSid, RecordingUrl, RecordingSid, RecordingDuration } = req.body;

            logger.info('Recording received', { CallSid, RecordingSid });

            const session = await container.voiceSessionRepo.findByCallSid(CallSid);

            if (!session) {
                res.sendStatus(404);
                return;
            }

            await container.handleCallRecording.execute(
                session.id,
                CallSid,
                RecordingUrl,
                RecordingSid,
                parseInt(RecordingDuration || '0', 10)
            );

            res.sendStatus(200);
        } catch (error: any) {
            logger.error('Error in handleRecording', error);
            res.sendStatus(500);
        }
    }

    private async handleTransfer(
        callSid: string,
        sessionId: string,
        reason: string,
        res: Response
    ): Promise<void> {
        const transferNumber = process.env.EMERGENCY_TRANSFER_NUMBER!;

        await container.voiceSessionRepo.update(sessionId, {
            transferred: true,
            transferReason: reason
        });

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Joanna">Transferring you now. Please stay on the line.</Say>
        <Dial>${transferNumber}</Dial>
      </Response>`;

        res.type('text/xml').send(twiml);
    }
}