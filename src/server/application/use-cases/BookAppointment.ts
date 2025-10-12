import { ISchedulingService } from '../../domain/interfaces/services/ISchedulingService';
import { Result, success, failure } from '../../domain/types/Result';
import { Appointment, AppointmentType } from '../../domain/entities/Appointment';
import { IAppointmentRepo } from '@/server/domain/interfaces/repositories/IAppointmentRepo';

export interface BookAppointmentInput {
  patientId: string;
  preferredDate?: Date;
  preferredTime?: string;
  reason: string;
  symptoms?: string[];
  type: AppointmentType;
  voiceSessionId?: string;
}

export class BookAppointment {
  constructor(
    private appointmentRepo: IAppointmentRepo,
    private schedulingService: ISchedulingService
  ) { }

  async execute(input: BookAppointmentInput): Promise<Result<Appointment>> {
    try {
      const availableSlots = await this.schedulingService.findAvailableSlots({
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        duration: 30,
        appointmentType: input.type
      });

      if (availableSlots.length === 0) {
        return failure(new Error('No available slots found'));
      }

      const selectedSlot = availableSlots[0];

      const appointment = await this.appointmentRepo.create({
        patientId: input.patientId,
        dateTime: selectedSlot.dateTime,
        type: input.type,
        reason: input.reason,
        symptoms: input.symptoms,
        doctorName: selectedSlot.doctorName,
        duration: 30,
        createdFrom: 'VOICE',
        voiceSessionId: input.voiceSessionId
      });

      return success(appointment);
    } catch (error) {
      return failure(error as Error);
    }
  }
}