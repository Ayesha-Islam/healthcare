export enum SessionStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    TRANSFERRED = 'TRANSFERRED',
    FAILED = 'FAILED'
}

export enum CallIntent {
    APPOINTMENT = 'APPOINTMENT',
    EMERGENCY = 'EMERGENCY',
    INQUIRY = 'INQUIRY',
    PRESCRIPTION = 'PRESCRIPTION',
    RESULTS = 'RESULTS',
    OTHER = 'OTHER'
}

export interface ConversationTurn {
    speaker: 'AI' | 'CALLER';
    text: string;
    timestamp: Date;
    confidence?: number;
}

export interface VoiceSession {
    id: string;
    callSid: string;
    patientId?: string;
    phoneNumber: string;
    status: SessionStatus;
    intent?: CallIntent;
    transcript: ConversationTurn[];
    collectedInfo: {
        name?: string;
        symptoms?: string[];
        urgency?: 'HIGH' | 'MEDIUM' | 'LOW';
        preferredDate?: Date;
        preferredTime?: string;
    };
    appointmentId?: string;
    transferred: boolean;
    transferReason?: string;
    duration?: number; // in seconds
    recordingUrl?: string;
    startedAt: Date;
    endedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateVoiceSessionDTO {
    callSid: string;
    phoneNumber: string;
    patientId?: string;
}

export interface UpdateVoiceSessionDTO {
    status?: SessionStatus;
    intent?: CallIntent;
    transcript?: ConversationTurn[];
    collectedInfo?: VoiceSession['collectedInfo'];
    appointmentId?: string;
    transferred?: boolean;
    transferReason?: string;
    duration?: number;
    recordingUrl?: string;
    endedAt?: Date;
}