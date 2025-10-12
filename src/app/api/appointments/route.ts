import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/infrastructure/container';
import { z } from 'zod';
import { AppointmentType } from '@/server/domain/entities/Appointment';

const bookAppointmentSchema = z.object({
  patientId: z.string(),
  preferredDate: z.string().transform(str => new Date(str)),
  reason: z.string(),
  type: z.nativeEnum(AppointmentType),
  symptoms: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookAppointmentSchema.parse(body);

    const result = await container.bookAppointment.execute(data);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}