import twilio from 'twilio';
import axios from 'axios';
import * as fs from 'fs';
import { ITwilioService, TwilioCallOptions, TwilioResponse } from '../../domain/interfaces/services/ITwilioService';

export class TwilioService implements ITwilioService {
    private client: twilio.Twilio;
    private accountSid: string;
    private authToken: string;

    constructor(accountSid: string, authToken: string) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.client = twilio(accountSid, authToken);
    }

    async initiateCall(options: TwilioCallOptions): Promise<TwilioResponse> {
        try {
            const call = await this.client.calls.create({
                to: options.to,
                from: options.from,
                url: options.url,
                statusCallback: options.statusCallback
            });

            return {
                success: true,
                callSid: call.sid
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async transferCall(callSid: string, to: string): Promise<TwilioResponse> {
        try {
            await this.client.calls(callSid).update({
                twiml: `<Response><Dial>${to}</Dial></Response>`
            });

            return { success: true, callSid };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async endCall(callSid: string): Promise<void> {
        try {
            await this.client.calls(callSid).update({ status: 'completed' });
        } catch (error: any) {
            console.error('Error ending call:', error.message);
        }
    }

    async sendSMS(to: string, message: string): Promise<void> {
        try {
            await this.client.messages.create({
                to,
                from: process.env.TWILIO_PHONE_NUMBER!,
                body: message
            });
        } catch (error: any) {
            console.error('Error sending SMS:', error.message);
            throw error;
        }
    }

    async getCallStatus(callSid: string): Promise<string> {
        try {
            const call = await this.client.calls(callSid).fetch();
            return call.status;
        } catch (error: any) {
            console.error('Error fetching call status:', error.message);
            return 'unknown';
        }
    }

    async downloadRecording(recordingSid: string, savePath: string): Promise<string> {
        try {
            const recording = await this.client.recordings(recordingSid).fetch();
            const recordingUrl = `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`;

            const response = await axios.get(recordingUrl, {
                responseType: 'stream',
                auth: {
                    username: this.accountSid,
                    password: this.authToken
                }
            });

            const writer = fs.createWriteStream(savePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(savePath));
                writer.on('error', reject);
            });
        } catch (error: any) {
            console.error('Error downloading recording:', error.message);
            throw error;
        }
    }
}