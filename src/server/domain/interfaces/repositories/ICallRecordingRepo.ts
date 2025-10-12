import { CallRecording, CreateCallRecordingDTO, UpdateCallRecordingDTO } from "../../entities/CallRecording";

export interface ICallRecordingRepo {
    findById(id: string): Promise<CallRecording | null>;
    findByVoiceSessionId(voiceSessionId: string): Promise<CallRecording[]>;
    findByCallSid(callSid: string): Promise<CallRecording | null>;
    create(data: CreateCallRecordingDTO): Promise<CallRecording>;
    update(id: string, data: UpdateCallRecordingDTO): Promise<CallRecording>;
    delete(id: string): Promise<void>;
}