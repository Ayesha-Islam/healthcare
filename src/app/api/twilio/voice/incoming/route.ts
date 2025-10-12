import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';
import { logger } from '@/server/infrastructure/config/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const CallSid = formData.get('CallSid') as string;
    const From = formData.get('From') as string;

    logger.info('Incoming call', { CallSid, From });

    const result = await container.handleIncomingCall.execute(CallSid, From);

    if (result.isFailure) {
      logger.error('Failed to handle incoming call', result.error);
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="Polly.Joanna">We are experiencing technical difficulties. Please try again later.</Say>
          <Hangup/>
        </Response>`;

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const session = result.value;
    const greeting = session.patientId
      ? 'Welcome back! How can I help you today?'
      : 'Thank you for calling. To better assist you, may I have your full name?';

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Gather input="speech" timeout="5" action="${process.env.NEXT_PUBLIC_API_URL}/api/twilio/voice/process">
          <Say voice="Polly.Joanna">${greeting}</Say>
        </Gather>
        <Redirect>${process.env.NEXT_PUBLIC_API_URL}/api/twilio/voice/process</Redirect>
      </Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    logger.error('Error in handleIncoming', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}