import { PrismaClient } from '@prisma/client';
import { VoiceSession, CreateVoiceSessionDTO, UpdateVoiceSessionDTO, SessionStatus, CallIntent } from '../../../domain/entities/VoiceSession';
import { IVoiceSessionRepo } from '@/server/domain/interfaces/repositories/IVoiceSessionRepo';

export class VoiceSessionRepo implements IVoiceSessionRepo {
  constructor(private prisma: PrismaClient) { }

  async findById(id: string): Promise<VoiceSession | null> {
    const session = await this.prisma.voiceSession.findUnique({ where: { id } });
    return session ? this.toDomain(session) : null;
  }

  async findByCallSid(callSid: string): Promise<VoiceSession | null> {
    const session = await this.prisma.voiceSession.findUnique({ where: { callSid } });
    return session ? this.toDomain(session) : null;
  }

  async findByPatientId(patientId: string): Promise<VoiceSession[]> {
    const sessions = await this.prisma.voiceSession.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
    return sessions.map((s: any) => this.toDomain(s));
  }

  async findByStatus(status: SessionStatus): Promise<VoiceSession[]> {
    const sessions = await this.prisma.voiceSession.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
    return sessions.map((s: any) => this.toDomain(s));
  }

  async create(data: CreateVoiceSessionDTO): Promise<VoiceSession> {
    const session = await this.prisma.voiceSession.create({
      data: {
        callSid: data.callSid,
        phoneNumber: data.phoneNumber,
        patientId: data.patientId,
        transcript: JSON.stringify([]),
        collectedInfo: JSON.stringify({})
      }
    });
    return this.toDomain(session);
  }

  async update(id: string, data: UpdateVoiceSessionDTO): Promise<VoiceSession> {
    const session = await this.prisma.voiceSession.update({
      where: { id },
      data: {
        status: data.status,
        intent: data.intent,
        transcript: data.transcript ? JSON.stringify(data.transcript) : undefined,
        collectedInfo: data.collectedInfo ? JSON.stringify(data.collectedInfo) : undefined,
        appointmentId: data.appointmentId,
        transferred: data.transferred,
        transferReason: data.transferReason,
        duration: data.duration,
        recordingUrl: data.recordingUrl,
        endedAt: data.endedAt
      }
    });
    return this.toDomain(session);
  }

  async findRecent(limit = 100): Promise<VoiceSession[]> {
    const sessions = await this.prisma.voiceSession.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    return sessions.map((s: any) => this.toDomain(s));
  }

  private toDomain(session: any): VoiceSession {
    return {
      id: session.id,
      callSid: session.callSid,
      patientId: session.patientId,
      phoneNumber: session.phoneNumber,
      status: session.status as SessionStatus,
      intent: session.intent as CallIntent,
      transcript: session.transcript ? JSON.parse(session.transcript) : [],
      collectedInfo: session.collectedInfo ? JSON.parse(session.collectedInfo) : {},
      appointmentId: session.appointmentId,
      transferred: session.transferred,
      transferReason: session.transferReason,
      duration: session.duration,
      recordingUrl: session.recordingUrl,
      startedAt: new Date(session.startedAt),
      endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt)
    };
  }
}
