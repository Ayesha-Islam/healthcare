import { PrismaClient } from '@/db/generated/client';
import { getPrismaClient } from '../config/database';
import { config } from '../config/env';

// Repositories
import { PatientRepo } from '../database/repositories/PatientRepo';
import { AppointmentRepo } from '../database/repositories/AppointmentRepo';
import { VoiceSessionRepo } from '../database/repositories/VoiceSessionRepo';
import { CallRecordingRepo } from '../database/repositories/CallRecordingRepo';

// Services
import { GroqAIService } from '../external-services/GroqAIService';
import { ChromaDBService } from '../external-services/ChromaDBService';
import { TwilioService } from '../external-services/TwilioService';
import { SchedulingService } from '../external-services/SchedulingService';
import { ValidationService } from '../../application/services/ValidationService';

// Use Cases
import { HandleIncomingCall } from '../../application/use-cases/HandleIncomingCall';
import { ProcessVoiceInput } from '../../application/use-cases/ProcessVoiceInput';
import { BookAppointment } from '../../application/use-cases/BookAppointment';
import { RegisterPatient } from '../../application/use-cases/RegisterPatient';
import { HandleCallRecording } from '../../application/use-cases/HandleCallRecording';
import { GetCallAnalytics } from '../../application/use-cases/GetCallAnalytics';

export class Container {
    private static instance: Container | null = null;
    private static isInitializing = false;

    private prisma: PrismaClient;

    // Repositories
    public patientRepo: PatientRepo;
    public appointmentRepo: AppointmentRepo;
    public voiceSessionRepo: VoiceSessionRepo;
    public callRecordingRepo: CallRecordingRepo;

    // Services
    public aiService: GroqAIService;
    public vectorDbService: ChromaDBService;
    public twilioService: TwilioService;
    public schedulingService: SchedulingService;
    public validationService: ValidationService;

    // Use Cases
    public handleIncomingCall: HandleIncomingCall;
    public processVoiceInput: ProcessVoiceInput;
    public bookAppointment: BookAppointment;
    public registerPatient: RegisterPatient;
    public handleCallRecording: HandleCallRecording;
    public getCallAnalytics: GetCallAnalytics;

    private constructor() {
        // Lazy initialization - only initialize when actually called at runtime
        this.prisma = getPrismaClient();

        // Initialize repositories
        this.patientRepo = new PatientRepo(this.prisma);
        this.appointmentRepo = new AppointmentRepo(this.prisma);
        this.voiceSessionRepo = new VoiceSessionRepo(this.prisma);
        this.callRecordingRepo = new CallRecordingRepo(this.prisma);

        // Initialize services
        this.aiService = new GroqAIService(config.ai.groqApiKey);
        this.vectorDbService = new ChromaDBService(config.chroma.url);
        this.twilioService = new TwilioService(
            config.twilio.accountSid,
            config.twilio.authToken
        );
        this.schedulingService = new SchedulingService(
            this.appointmentRepo,
            this.twilioService
        );
        this.validationService = new ValidationService();

        // Initialize use cases
        this.handleIncomingCall = new HandleIncomingCall(
            this.voiceSessionRepo,
            this.patientRepo
        );
        this.processVoiceInput = new ProcessVoiceInput(
            this.aiService,
            this.voiceSessionRepo
        );
        this.bookAppointment = new BookAppointment(
            this.appointmentRepo,
            this.schedulingService
        );
        this.registerPatient = new RegisterPatient(
            this.patientRepo
        );
        this.handleCallRecording = new HandleCallRecording(
            this.callRecordingRepo,
            this.twilioService
        );
        this.getCallAnalytics = new GetCallAnalytics(
            this.voiceSessionRepo,
            this.appointmentRepo
        );
    }

    public static getInstance(): Container {
        // Only create instance when actually needed (at runtime)
        if (!Container.instance && !Container.isInitializing) {
            Container.isInitializing = true;
            Container.instance = new Container();
            Container.isInitializing = false;
        }

        if (!Container.instance) {
            throw new Error('Container is still initializing');
        }

        return Container.instance;
    }

    public async cleanup(): Promise<void> {
        await this.prisma.$disconnect();
    }
}

// Export a getter function instead of the instance directly
export function getContainer(): Container {
    return Container.getInstance();
}