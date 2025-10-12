import { config } from './env';

export interface TwilioWebhookRequest {
    CallSid: string;
    From: string;
    To: string;
    CallStatus?: string;
    RecordingUrl?: string;
    RecordingSid?: string;
    RecordingDuration?: string;
}

export function validateTwilioRequest(signature: string, url: string, params: any): boolean {
    if (config.isDevelopment) {
        return true;
    }

    const twilio = require('twilio');
    const authToken = config.twilio.authToken;

    return twilio.validateRequest(authToken, signature, url, params);
}

export function buildTwiMLResponse(message: string, options?: {
    gather?: boolean;
    redirect?: string;
    hangup?: boolean;
}): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

    if (options?.gather) {
        twiml += `<Gather input="speech" timeout="5" action="${options.redirect || '/api/twilio/voice/process'}">`;
        twiml += `<Say voice="Polly.Joanna">${message}</Say>`;
        twiml += '</Gather>';
    } else {
        twiml += `<Say voice="Polly.Joanna">${message}</Say>`;
    }

    if (options?.redirect) {
        twiml += `<Redirect>${options.redirect}</Redirect>`;
    }

    if (options?.hangup) {
        twiml += '<Hangup/>';
    }

    twiml += '</Response>';
    return twiml;
}