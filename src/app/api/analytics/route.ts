import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Analytics endpoint',
      data: {
        totalCalls: 0,
        totalPatients: 0,
        totalAppointments: 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
