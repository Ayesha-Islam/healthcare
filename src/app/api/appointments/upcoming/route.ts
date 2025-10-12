import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');

        const appointments = await container.appointmentRepo.findUpcoming(limit);
        return NextResponse.json(appointments);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
export const dynamic = 'force-dynamic';