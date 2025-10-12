export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW'
}

export enum AppointmentType {
    CONSULTATION = 'CONSULTATION',
    FOLLOW_UP = 'FOLLOW_UP',
    EMERGENCY = 'EMERGENCY',
    ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
    SPECIALIST = 'SPECIALIST'
}

export interface Appointment {
    id: string;
    patientId: string;
    dateTime: Date;
    type: AppointmentType;
    status: AppointmentStatus | '';
    reason: string;
    symptoms?: string[];
    notes?: string;
    doctorName?: string;
    duration: number; // in minutes
    reminderSent: boolean;
    createdFrom: 'VOICE' | 'ONLINE' | 'STAFF';
    voiceSessionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAppointmentDTO {
    patientId: string;
    dateTime: Date;
    type: AppointmentType;
    reason: string;
    symptoms?: string[];
    notes?: string;
    doctorName?: string;
    duration?: number;
    createdFrom: 'VOICE' | 'ONLINE' | 'STAFF';
    voiceSessionId?: string;
}

export interface UpdateAppointmentDTO {
    dateTime?: Date;
    status?: AppointmentStatus;
    notes?: string;
    reminderSent?: boolean;
}