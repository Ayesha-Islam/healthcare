import { PrismaClient } from '@prisma/client';
import { Patient, CreatePatientDTO, UpdatePatientDTO } from '../../../domain/entities/Patient';
import { IPatientRepo } from '@/server/domain/interfaces/repositories/IPatientRepo';

export class PatientRepo implements IPatientRepo {
  constructor(private prisma: PrismaClient) { }

  async findById(id: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    return patient ? this.toDomain(patient) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({ where: { phoneNumber } });
    return patient ? this.toDomain(patient) : null;
  }

  async create(data: CreatePatientDTO): Promise<Patient> {
    const patient = await this.prisma.patient.create({
      data: {
        phoneNumber: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        address: data.address,
        emergencyContact: data.emergencyContact
      }
    });
    return this.toDomain(patient);
  }

  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        emergencyContact: data.emergencyContact,
        medicalHistory: data.medicalHistory ? JSON.stringify(data.medicalHistory) : undefined,
        allergies: data.allergies ? JSON.stringify(data.allergies) : undefined,
        currentMedications: data.currentMedications ? JSON.stringify(data.currentMedications) : undefined,
        insuranceInfo: data.insuranceInfo ? JSON.stringify(data.insuranceInfo) : undefined
      }
    });
    return this.toDomain(patient);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.patient.delete({ where: { id } });
  }

  async findAll(limit = 100, offset = 0): Promise<Patient[]> {
    const patients = await this.prisma.patient.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
    return patients.map((p: any) => this.toDomain(p));
  }

  private toDomain(patient: any): Patient {
    return {
      id: patient.id,
      phoneNumber: patient.phoneNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: new Date(patient.dateOfBirth),
      email: patient.email,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      medicalHistory: patient.medicalHistory ? JSON.parse(patient.medicalHistory) : [],
      allergies: patient.allergies ? JSON.parse(patient.allergies) : [],
      currentMedications: patient.currentMedications ? JSON.parse(patient.currentMedications) : [],
      insuranceInfo: patient.insuranceInfo ? JSON.parse(patient.insuranceInfo) : undefined,
      createdAt: new Date(patient.createdAt),
      updatedAt: new Date(patient.updatedAt)
    };
  }
}