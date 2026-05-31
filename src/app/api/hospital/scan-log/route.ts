import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['HOSPITAL_STAFF', 'DOCTOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId, method } = await req.json();

    if (!patientId || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scanLog = await prisma.scanLog.create({
      data: {
        doctorId: session.user.id,
        patientId,
        method,
      }
    });

    return NextResponse.json(scanLog);
  } catch (error) {
    console.error('[SCAN_LOG_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['HOSPITAL_STAFF', 'DOCTOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.scanLog.findMany({
      where: { doctorId: session.user.id },
      orderBy: { scannedAt: 'desc' },
      take: 5,
      include: {
        patient: {
          select: { name: true, image: true, id: true }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('[SCAN_LOG_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
