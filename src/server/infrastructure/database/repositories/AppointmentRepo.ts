import { PrismaClient } from '@prisma/client';
import { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO, AppointmentStatus, AppointmentType } from '../../../domain/entities/Appointment';
import { IAppointmentRepo } from '@/server/domain/interfaces/repositories/IAppointmentRepo';

export class AppointmentRepo implements IAppointmentRepo {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<Appointment | null> {
        const appointment = await this.prisma.appointment.findUnique({ where: { id } });
        return appointment ? this.toDomain(appointment) : null;
    }

    async findByPatientId(patientId: string): Promise<Appointment[]> {
        const appointments = await this.prisma.appointment.findMany({
            where: { patientId },
            orderBy: { dateTime: 'desc' }
        });
        return appointments.map((a: any) => this.toDomain(a));
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
        const appointments = await this.prisma.appointment.findMany({
            where: {
                dateTime: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { dateTime: 'asc' }
        });
        return appointments.map((a: any) => this.toDomain(a));
    }

    async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
        const appointments = await this.prisma.appointment.findMany({
            where: { status },
            orderBy: { dateTime: 'asc' }
        });
        return appointments.map((a: any) => this.toDomain(a));
    }

    async create(data: CreateAppointmentDTO): Promise<Appointment> {
        const appointment = await this.prisma.appointment.create({
            data: {
                patientId: data.patientId,
                dateTime: data.dateTime,
                type: data.type,
                reason: data.reason,
                symptoms: data.symptoms ? JSON.stringify(data.symptoms) : undefined,
                notes: data.notes,
                doctorName: data.doctorName,
                duration: data.duration || 30,
                createdFrom: data.createdFrom,
                voiceSessionId: data.voiceSessionId
            }
        });
        return this.toDomain(appointment);
    }

    async update(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
        const appointment = await this.prisma.appointment.update({
            where: { id },
            data: {
                dateTime: data.dateTime,
                status: data.status,
                notes: data.notes,
                reminderSent: data.reminderSent
            }
        });
        return this.toDomain(appointment);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.appointment.delete({ where: { id } });
    }

    async checkAvailability(dateTime: Date, duration: number): Promise<boolean> {
        const endTime = new Date(dateTime.getTime() + duration * 60000);

        const conflicting = await this.prisma.appointment.findFirst({
            where: {
                AND: [
                    { dateTime: { lt: endTime } },
                    { dateTime: { gte: dateTime } },
                    { status: { not: 'CANCELLED' } }
                ]
            }
        });

        return !conflicting;
    }

    async findUpcoming(limit = 10): Promise<Appointment[]> {
        const now = new Date();
        const appointments = await this.prisma.appointment.findMany({
            where: {
                dateTime: { gte: now },
                status: { in: ['SCHEDULED', 'CONFIRMED'] }
            },
            orderBy: { dateTime: 'asc' },
            take: limit
        });
        return appointments.map((a: any) => this.toDomain(a));
    }

    private toDomain(appointment: any): Appointment {
        return {
            id: appointment.id,
            patientId: appointment.patientId,
            dateTime: new Date(appointment.dateTime),
            type: appointment.type as AppointmentType,
            status: appointment.status as AppointmentStatus,
            reason: appointment.reason,
            symptoms: appointment.symptoms ? JSON.parse(appointment.symptoms) : undefined,
            notes: appointment.notes,
            doctorName: appointment.doctorName,
            duration: appointment.duration,
            reminderSent: appointment.reminderSent,
            createdFrom: appointment.createdFrom as 'VOICE' | 'ONLINE' | 'STAFF',
            voiceSessionId: appointment.voiceSessionId,
            createdAt: new Date(appointment.createdAt),
            updatedAt: new Date(appointment.updatedAt)
        };
    }
}