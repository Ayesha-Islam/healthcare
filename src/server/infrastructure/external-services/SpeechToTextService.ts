export interface TranscriptionResult {
    text: string;
    confidence: number;
    language: string;
    duration: number;
}

export class SpeechToTextService {

    //Process Twilio speech input
    //Twilio provides speech-to-text automatically via the Gather verb
    processTwilioSpeechResult(twilioData: any): TranscriptionResult {
        return {
            text: twilioData.TranscriptionText || '',
            confidence: parseFloat(twilioData.TranscriptionConfidence || '0'),
            language: 'en-US',
            duration: parseFloat(twilioData.RecordingDuration || '0')
        };
    }

    //Process audio recording transcription
    processRecordingTranscription(twilioData: any): TranscriptionResult {
        return {
            text: twilioData.TranscriptionText || '',
            confidence: parseFloat(twilioData.TranscriptionConfidence || '0'),
            language: 'en-US',
            duration: parseFloat(twilioData.RecordingDuration || '0')
        };
    }

    //Validate transcription quality
    isGoodQuality(result: TranscriptionResult): boolean {
        return result.confidence >= 0.7 && result.text.length > 0;
    }
}