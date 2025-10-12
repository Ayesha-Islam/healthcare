export interface TwilioWebhookParams {
    CallSid: string;
    AccountSid: string;
    From: string;
    To: string;
    CallStatus: string;
    ApiVersion: string;
    Direction: string;
    ForwardedFrom?: string;
    CallerName?: string;
    SpeechResult?: string;
    Confidence?: string;
    RecordingSid?: string;
    RecordingUrl?: string;
    RecordingStatus?: string;
    RecordingDuration?: string;
    TranscriptionSid?: string;
    TranscriptionText?: string;
    TranscriptionStatus?: string;
    TranscriptionUrl?: string;
}

export type CallStatus =
    | 'queued'
    | 'ringing'
    | 'in-progress'
    | 'completed'
    | 'busy'
    | 'failed'
    | 'no-answer'
    | 'canceled';

export type RecordingStatus =
    | 'in-progress'
    | 'completed'
    | 'absent'
    | 'failed';

export interface CallMetrics {
    totalCalls: number;
    completedCalls: number;
    averageDuration: number;
    emergencyCalls: number;
    appointmentsScheduled: number;
    topSymptoms: Array<{ symptom: string; count: number; }>;
}