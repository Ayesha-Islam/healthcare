import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const CallSid = formData.get('CallSid') as string;
        const SpeechResult = formData.get('SpeechResult') as string;

        if (!SpeechResult) {
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Gather input="speech" timeout="5" action="/api/twilio/voice/process">
            <Say voice="Polly.Joanna">I didn't catch that. Could you please repeat?</Say>
          </Gather>
        </Response>`;

            return new NextResponse(twiml, {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const session = await container.voiceSessionRepo.findByCallSid(CallSid);
        if (!session) {
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="Polly.Joanna">Session not found. Please call again.</Say>
          <Hangup/>
        </Response>`;

            return new NextResponse(twiml, {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const result = await container.processVoiceInput.execute(
            session.id,
            SpeechResult
        );

        if (result.isFailure) {
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="Polly.Joanna">I apologize, but I encountered an error. Let me transfer you to a staff member.</Say>
        </Response>`;

            return new NextResponse(twiml, {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const { response, shouldTransfer } = result.value;

        if (shouldTransfer) {
            const transferNumber = process.env.EMERGENCY_TRANSFER_NUMBER || '+19999999999';
            const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="Polly.Joanna">Transferring you now. Please stay on the line.</Say>
          <Dial>${transferNumber}</Dial>
        </Response>`;

            return new NextResponse(twiml, {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Gather input="speech" timeout="5" action="/api/twilio/voice/process">
          <Say voice="Polly.Joanna">${response}</Say>
        </Gather>
        <Redirect>/api/twilio/voice/process</Redirect>
      </Response>`;

        return new NextResponse(twiml, {
            headers: { 'Content-Type': 'text/xml' },
        });
    } catch (error) {
        console.error('Error in processInput', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}