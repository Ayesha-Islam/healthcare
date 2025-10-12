import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';
import { prisma } from '@/server/infrastructure/config/database';

export async function GET(request: NextRequest) {
  try {

    await prisma.$connect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const patients = await container.patientRepo.findAll(limit, offset);

    return NextResponse.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await container.registerPatient.execute(body);

    if (result.isFailure) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.value
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
