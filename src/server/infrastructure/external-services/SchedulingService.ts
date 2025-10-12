import { ISchedulingService, SchedulingOptions, TimeSlot } from '../../domain/interfaces/services/ISchedulingService';
import { IAppointmentRepo } from '../../domain/interfaces/repositories/IAppointmentRepo';
import { ITwilioService } from '../../domain/interfaces/services/ITwilioService';
import { AppointmentStatus, AppointmentType } from '../../domain/entities/Appointment';

export class SchedulingService implements ISchedulingService {
    private workingHours = { start: 9, end: 17 };
    private slotDuration = 30; // minutes
    private doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'];

    constructor(
        private appointmentRepo: IAppointmentRepo,
        private twilioService: ITwilioService
    ) { }

    async findAvailableSlots(options: SchedulingOptions): Promise<TimeSlot[]> {
        const slots: TimeSlot[] = [];
        const startDate = options.preferredDate || new Date();

        // Search for slots in the next 14 days
        for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
            const checkDate = new Date(startDate);
            checkDate.setDate(checkDate.getDate() + dayOffset);

            // Skip weekends
            if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
                continue;
            }

            const daySlots = await this.getDaySlots(checkDate, options.duration || 30);
            slots.push(...daySlots);

            // Return first 10 available slots
            if (slots.length >= 10) {
                break;
            }
        }

        return slots.slice(0, 10);
    }

    private async getDaySlots(date: Date, duration: number): Promise<TimeSlot[]> {
        const slots: TimeSlot[] = [];

        for (let hour = this.workingHours.start; hour < this.workingHours.end; hour++) {
            for (let minute = 0; minute < 60; minute += this.slotDuration) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, minute, 0, 0);

                // Skip past times
                if (slotTime < new Date()) {
                    continue;
                }

                const isAvailable = await this.appointmentRepo.checkAvailability(slotTime, duration);

                if (isAvailable) {
                    slots.push({
                        dateTime: slotTime,
                        available: true,
                        doctorName: this.doctors[Math.floor(Math.random() * this.doctors.length)]
                    });
                }
            }
        }

        return slots;
    }

    async bookAppointment(patientId: string, slot: TimeSlot, reason: string): Promise<string> {
        const appointment = await this.appointmentRepo.create({
            patientId,
            dateTime: slot.dateTime,
            type: AppointmentType.CONSULTATION,
            reason,
            doctorName: slot.doctorName,
            duration: this.slotDuration,
            createdFrom: 'VOICE'
        });

        return appointment.id;
    }

    async cancelAppointment(appointmentId: string): Promise<void> {
        await this.appointmentRepo.update(appointmentId, {
            status: AppointmentStatus.CANCELLED
        });
    }

    async rescheduleAppointment(appointmentId: string, newSlot: TimeSlot): Promise<void> {
        await this.appointmentRepo.update(appointmentId, {
            dateTime: newSlot.dateTime
        });
    }

    async sendReminder(appointmentId: string): Promise<void> {
        const appointment = await this.appointmentRepo.findById(appointmentId);

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        // Get patient phone number (would need patient repo access)
        const message = `Reminder: You have an appointment on ${appointment.dateTime.toLocaleString()} with ${appointment.doctorName}. Reply CONFIRM to confirm or CANCEL to cancel.`;

        // In a real implementation, we'd send this SMS
        console.log(`Reminder would be sent: ${message}`);

        await this.appointmentRepo.update(appointmentId, {
            reminderSent: true
        });
    }
}