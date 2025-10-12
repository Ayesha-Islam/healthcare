import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phoneNumber: string; }>; }
) {

  try {
    const { phoneNumber } = await params; // Await the params
    const patient = await container.patientRepo.findByPhoneNumber(
      phoneNumber
    );

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient
    });
  } catch (error: any) {
    console.error('Error fetching patient by phone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
