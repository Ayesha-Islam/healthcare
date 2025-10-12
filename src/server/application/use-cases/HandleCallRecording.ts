import { ITwilioService } from '../../domain/interfaces/services/ITwilioService';
import { Result, success, failure } from '../../domain/types/Result';
import { CallRecording } from '../../domain/entities/CallRecording';
import { ICallRecordingRepo } from '@/server/domain/interfaces/repositories/ICallRecordingRepo';

export class HandleCallRecording {
    constructor(
        private recordingRepo: ICallRecordingRepo,
        private twilioService: ITwilioService
    ) { }

    async execute(
        voiceSessionId: string,
        callSid: string,
        recordingUrl: string,
        recordingSid: string,
        duration: number
    ): Promise<Result<CallRecording>> {
        try {
            const recording = await this.recordingRepo.create({
                voiceSessionId,
                callSid,
                recordingUrl,
                recordingSid,
                duration,
                format: 'mp3'
            });

            const localPath = `./data/recordings/${recording.id}.mp3`;
            await this.twilioService.downloadRecording(recordingSid, localPath);

            await this.recordingRepo.update(recording.id, {
                localPath,
                transcriptionStatus: 'PENDING'
            });

            return success(recording);
        } catch (error) {
            return failure(error as Error);
        }
    }
}