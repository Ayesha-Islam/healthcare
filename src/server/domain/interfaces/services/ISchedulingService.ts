export interface SchedulingOptions {
    preferredDate?: Date;
    preferredTime?: string;
    duration?: number;
    appointmentType: string;
}

export interface TimeSlot {
    dateTime: Date;
    available: boolean;
    doctorName?: string;
}

export interface ISchedulingService {
    findAvailableSlots(options: SchedulingOptions): Promise<TimeSlot[]>;
    bookAppointment(patientId: string, slot: TimeSlot, reason: string): Promise<string>;
    cancelAppointment(appointmentId: string): Promise<void>;
    rescheduleAppointment(appointmentId: string, newSlot: TimeSlot): Promise<void>;
    sendReminder(appointmentId: string): Promise<void>;
}