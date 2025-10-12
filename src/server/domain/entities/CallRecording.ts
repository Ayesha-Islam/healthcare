export interface CallRecording {
    id: string;
    voiceSessionId: string;
    callSid: string;
    recordingUrl: string;
    recordingSid?: string;
    localPath?: string;
    duration: number;
    format: string;
    transcription?: string;
    transcriptionStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    qualityScore?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCallRecordingDTO {
    voiceSessionId: string;
    callSid: string;
    recordingUrl: string;
    recordingSid?: string;
    duration: number;
    format?: string;
}

export interface UpdateCallRecordingDTO {
    localPath?: string;
    transcription?: string;
    transcriptionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
    qualityScore?: number;
}