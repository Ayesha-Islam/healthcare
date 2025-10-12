import { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO, AppointmentStatus } from '../../entities/Appointment';

export interface IAppointmentRepo {
    findById(id: string): Promise<Appointment | null>;
    findByPatientId(patientId: string): Promise<Appointment[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
    findByStatus(status: AppointmentStatus): Promise<Appointment[]>;
    create(data: CreateAppointmentDTO): Promise<Appointment>;
    update(id: string, data: UpdateAppointmentDTO): Promise<Appointment>;
    delete(id: string): Promise<void>;
    checkAvailability(dateTime: Date, duration: number): Promise<boolean>;
    findUpcoming(limit?: number): Promise<Appointment[]>;
}