import { CallIntent } from '../../entities/VoiceSession';

export interface AIAnalysisResult {
    intent: CallIntent;
    symptoms: string[];
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    entities: {
        name?: string;
        dates?: Date[];
        medications?: string[];
    };
    suggestedResponse: string;
    requiresTransfer: boolean;
    confidence: number;
}

export interface IAIService {
    analyzeTranscript(transcript: string): Promise<AIAnalysisResult>;
    generateResponse(context: string, userInput: string): Promise<string>;
    detectEmergency(text: string): Promise<boolean>;
    extractSymptoms(text: string): Promise<string[]>;
}