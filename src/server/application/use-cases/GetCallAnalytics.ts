import { IVoiceSessionRepo } from '@/server/domain/interfaces/repositories/IVoiceSessionRepo';
import { Result, success, failure } from '../../domain/types/Result';
import { IAppointmentRepo } from '@/server/domain/interfaces/repositories/IAppointmentRepo';

export interface CallAnalytics {
  totalCalls: number;
  completedCalls: number;
  transferredCalls: number;
  appointmentsBooked: number;
  averageDuration: number;
  intentDistribution: Record<string, number>;
  emergencyCalls: number;
}

export class GetCallAnalytics {
  constructor(
    private voiceSessionRepo: IVoiceSessionRepo,
    private appointmentRepo: IAppointmentRepo
  ) { }

  async execute(startDate?: Date, endDate?: Date): Promise<Result<CallAnalytics>> {
    try {
      const sessions = await this.voiceSessionRepo.findRecent(1000);

      const filteredSessions = sessions.filter(s => {
        if (!startDate || !endDate) return true;
        return s.createdAt >= startDate && s.createdAt <= endDate;
      });

      const intentDistribution: Record<string, number> = {};
      let totalDuration = 0;
      let emergencyCount = 0;

      filteredSessions.forEach(session => {
        if (session.intent) {
          intentDistribution[session.intent] = (intentDistribution[session.intent] || 0) + 1;
        }
        if (session.duration) {
          totalDuration += session.duration;
        }
        if (session.intent === 'EMERGENCY') {
          emergencyCount++;
        }
      });

      const voiceAppointments = await this.appointmentRepo.findByDateRange(
        startDate || new Date(0),
        endDate || new Date()
      );

      const analytics: CallAnalytics = {
        totalCalls: filteredSessions.length,
        completedCalls: filteredSessions.filter(s => s.status === 'COMPLETED').length,
        transferredCalls: filteredSessions.filter(s => s.transferred).length,
        appointmentsBooked: voiceAppointments.filter(a => a.createdFrom === 'VOICE').length,
        averageDuration: filteredSessions.length > 0 ? totalDuration / filteredSessions.length : 0,
        intentDistribution,
        emergencyCalls: emergencyCount
      };

      return success(analytics);
    } catch (error) {
      return failure(error as Error);
    }
  }
}