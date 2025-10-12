import { PrismaClient } from '@prisma/client';
import { CallRecording, CreateCallRecordingDTO, UpdateCallRecordingDTO } from '../../../domain/entities/CallRecording';
import { ICallRecordingRepo } from '@/server/domain/interfaces/repositories/ICallRecordingRepo';

export class CallRecordingRepo implements ICallRecordingRepo {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<CallRecording | null> {
        const recording = await this.prisma.callRecording.findUnique({ where: { id } });
        return recording ? this.toDomain(recording) : null;
    }

    async findByVoiceSessionId(voiceSessionId: string): Promise<CallRecording[]> {
        const recordings = await this.prisma.callRecording.findMany({
            where: { voiceSessionId },
            orderBy: { createdAt: 'desc' }
        });
        return recordings.map((r: any) => this.toDomain(r));
    }

    async findByCallSid(callSid: string): Promise<CallRecording | null> {
        const recording = await this.prisma.callRecording.findFirst({
            where: { callSid }
        });
        return recording ? this.toDomain(recording) : null;
    }

    async create(data: CreateCallRecordingDTO): Promise<CallRecording> {
        const recording = await this.prisma.callRecording.create({
            data: {
                voiceSessionId: data.voiceSessionId,
                callSid: data.callSid,
                recordingUrl: data.recordingUrl,
                recordingSid: data.recordingSid,
                duration: data.duration,
                format: data.format || 'mp3'
            }
        });
        return this.toDomain(recording);
    }

    async update(id: string, data: UpdateCallRecordingDTO): Promise<CallRecording> {
        const recording = await this.prisma.callRecording.update({
            where: { id },
            data: {
                localPath: data.localPath,
                transcription: data.transcription,
                transcriptionStatus: data.transcriptionStatus,
                qualityScore: data.qualityScore
            }
        });
        return this.toDomain(recording);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.callRecording.delete({ where: { id } });
    }

    private toDomain(recording: any): CallRecording {
        return {
            id: recording.id,
            voiceSessionId: recording.voiceSessionId,
            callSid: recording.callSid,
            recordingUrl: recording.recordingUrl,
            recordingSid: recording.recordingSid,
            localPath: recording.localPath,
            duration: recording.duration,
            format: recording.format,
            transcription: recording.transcription,
            transcriptionStatus: recording.transcriptionStatus as 'PENDING' | 'COMPLETED' | 'FAILED',
            qualityScore: recording.qualityScore,
            createdAt: new Date(recording.createdAt),
            updatedAt: new Date(recording.updatedAt)
        };
    }
}