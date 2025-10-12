import { Result, success, failure } from '../../domain/types/Result';
import { VoiceSession } from '../../domain/entities/VoiceSession';
import { IVoiceSessionRepo } from '@/server/domain/interfaces/repositories/IVoiceSessionRepo';
import { IPatientRepo } from '@/server/domain/interfaces/repositories/IPatientRepo';

export class HandleIncomingCall {
    constructor(
        private voiceSessionRepo: IVoiceSessionRepo,
        private patientRepo: IPatientRepo
    ) { }

    async execute(callSid: string, phoneNumber: string): Promise<Result<VoiceSession>> {
        try {
            const existingPatient = await this.patientRepo.findByPhoneNumber(phoneNumber);

            const session = await this.voiceSessionRepo.create({
                callSid,
                phoneNumber,
                patientId: existingPatient?.id
            });

            return success(session);
        } catch (error) {
            return failure(error as Error);
        }
    }
}