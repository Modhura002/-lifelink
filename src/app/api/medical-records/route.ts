import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'patientId query parameter is required' }, { status: 400 });
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ records, count: records.length });
  } catch (error) {
    console.error('[GET /api/medical-records]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, type, title, description, date, doctorName, hospitalName } = body;

    if (!patientId || !type || !title || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, type, title, date' },
        { status: 400 }
      );
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        type,
        title,
        description: description ?? null,
        date: String(date),
        doctorName: doctorName ?? null,
        hospitalName: hospitalName ?? null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('[POST /api/medical-records]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
