import { VoiceSession } from '../entities/VoiceSession';
import { Patient } from '../entities/Patient';

export interface CallContext {
    session: VoiceSession;
    patient?: Patient;
    conversationHistory: string[];
    currentIntent?: string;
    collectedData: Record<string, any>;
    stateFlags: {
        authenticated: boolean;
        informationCollected: boolean;
        appointmentBooked: boolean;
    };
}