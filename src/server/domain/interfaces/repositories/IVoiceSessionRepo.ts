import { VoiceSession, CreateVoiceSessionDTO, UpdateVoiceSessionDTO, SessionStatus } from '../../entities/VoiceSession';

export interface IVoiceSessionRepo {
    findById(id: string): Promise<VoiceSession | null>;
    findByCallSid(callSid: string): Promise<VoiceSession | null>;
    findByPatientId(patientId: string): Promise<VoiceSession[]>;
    findByStatus(status: SessionStatus): Promise<VoiceSession[]>;
    create(data: CreateVoiceSessionDTO): Promise<VoiceSession>;
    update(id: string, data: UpdateVoiceSessionDTO): Promise<VoiceSession>;
    findRecent(limit?: number): Promise<VoiceSession[]>;
}
