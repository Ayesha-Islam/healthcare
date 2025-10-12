import { IAIService } from '../../domain/interfaces/services/IAIService';
import { Result, success, failure } from '../../domain/types/Result';
import { ConversationTurn } from '../../domain/entities/VoiceSession';
import { IVoiceSessionRepo } from '@/server/domain/interfaces/repositories/IVoiceSessionRepo';

export interface ProcessVoiceInputResult {
  response: string;
  shouldTransfer: boolean;
  transferReason?: string;
  intent?: string;
}

export class ProcessVoiceInput {
  constructor(
    private aiService: IAIService,
    private voiceSessionRepo: IVoiceSessionRepo
  ) { }

  async execute(sessionId: string, userInput: string): Promise<Result<ProcessVoiceInputResult>> {
    try {
      const session = await this.voiceSessionRepo.findById(sessionId);
      if (!session) {
        return failure(new Error('Session not found'));
      }

      const isEmergency = await this.aiService.detectEmergency(userInput);

      if (isEmergency) {
        return success({
          response: "I'm detecting this might be an emergency. I'm transferring you to our emergency line right now.",
          shouldTransfer: true,
          transferReason: 'EMERGENCY'
        });
      }

      const conversationContext = session.transcript
        .map(t => `${t.speaker}: ${t.text}`)
        .join('\n');

      const aiResponse = await this.aiService.generateResponse(conversationContext, userInput);
      const analysis = await this.aiService.analyzeTranscript(userInput);

      const newTranscript: ConversationTurn[] = [
        ...session.transcript,
        { speaker: 'CALLER', text: userInput, timestamp: new Date() },
        { speaker: 'AI', text: aiResponse, timestamp: new Date() }
      ];

      await this.voiceSessionRepo.update(sessionId, {
        transcript: newTranscript,
        intent: analysis.intent,
        collectedInfo: {
          ...session.collectedInfo,
          symptoms: [...(session.collectedInfo.symptoms || []), ...analysis.symptoms],
          urgency: analysis.urgency
        }
      });

      return success({
        response: aiResponse,
        shouldTransfer: analysis.requiresTransfer,
        intent: analysis.intent
      });
    } catch (error) {
      return failure(error as Error);
    }
  }
}