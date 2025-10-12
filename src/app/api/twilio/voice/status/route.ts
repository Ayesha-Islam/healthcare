import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';
import { SessionStatus } from '@/server/domain/entities/VoiceSession';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const CallSid = formData.get('CallSid') as string;
        const CallStatus = formData.get('CallStatus') as string;
        const CallDuration = formData.get('CallDuration') as string;

        const session = await container.voiceSessionRepo.findByCallSid(CallSid);

        if (session && CallStatus === 'completed') {
            await container.voiceSessionRepo.update(session.id, {
                status: SessionStatus.COMPLETED,
                duration: parseInt(CallDuration || '0', 10),
                endedAt: new Date(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in handleStatus', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}