export interface TwilioCallOptions {
    to: string;
    from: string;
    url: string;
    statusCallback?: string;
}

export interface TwilioResponse {
    success: boolean;
    callSid?: string;
    error?: string;
}

export interface ITwilioService {
    initiateCall(options: TwilioCallOptions): Promise<TwilioResponse>;
    transferCall(callSid: string, to: string): Promise<TwilioResponse>;
    endCall(callSid: string): Promise<void>;
    sendSMS(to: string, message: string): Promise<void>;
    getCallStatus(callSid: string): Promise<string>;
    downloadRecording(recordingSid: string, savePath: string): Promise<string>;
}