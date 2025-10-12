import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id } = await params; // Await the params
    const patient = await container.patientRepo.findById(id);

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
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id } = await params; // Await the params
    const body = await request.json();
    const patient = await container.patientRepo.update(id, body);

    return NextResponse.json({
      success: true,
      data: patient
    });
  } catch (error: any) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}