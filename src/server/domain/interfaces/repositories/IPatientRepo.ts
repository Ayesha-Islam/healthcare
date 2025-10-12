import { Patient, CreatePatientDTO, UpdatePatientDTO } from '../../entities/Patient';

export interface IPatientRepo {
    findById(id: string): Promise<Patient | null>;
    findByPhoneNumber(phoneNumber: string): Promise<Patient | null>;
    create(data: CreatePatientDTO): Promise<Patient>;
    update(id: string, data: UpdatePatientDTO): Promise<Patient>;
    delete(id: string): Promise<void>;
    findAll(limit?: number, offset?: number): Promise<Patient[]>;
}