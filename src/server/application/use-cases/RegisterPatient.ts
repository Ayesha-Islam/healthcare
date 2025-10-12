import { CreatePatientDTO, Patient } from '../../domain/entities/Patient';
import { Result, success, failure } from '../../domain/types/Result';
import { ConflictError } from '../../domain/types/Errors';
import { IPatientRepo } from '@/server/domain/interfaces/repositories/IPatientRepo';

export class RegisterPatient {
    constructor(private patientRepo: IPatientRepo) { }

    async execute(data: CreatePatientDTO): Promise<Result<Patient>> {
        try {
            const existing = await this.patientRepo.findByPhoneNumber(data.phoneNumber);

            if (existing) {
                return failure(new ConflictError('Patient with this phone number already exists'));
            }

            const patient = await this.patientRepo.create(data);
            return success(patient);
        } catch (error) {
            return failure(error as Error);
        }
    }
}