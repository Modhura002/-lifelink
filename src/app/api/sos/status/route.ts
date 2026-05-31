import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emergencyId = request.nextUrl.searchParams.get('emergencyId');

    if (!emergencyId) {
      return NextResponse.json({ error: 'emergencyId is required' }, { status: 400 });
    }

    const emergency = await prisma.emergencyRequest.findUnique({
      where: { id: emergencyId },
      include: {
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
            driverProfile: {
              select: { licenseNumber: true, status: true },
            },
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        timeline: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!emergency) {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }

    // Only allow the patient who created it or the assigned driver to poll
    if (
      emergency.patientId !== session.user.id &&
      emergency.assignedDriverId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const elapsedMs = Date.now() - new Date(emergency.createdAt).getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    return NextResponse.json({
      emergencyId: emergency.id,
      status: emergency.status,
      severity: emergency.severity,
      city: emergency.city,
      description: emergency.description,
      patientLatitude: emergency.patientLatitude,
      patientLongitude: emergency.patientLongitude,
      assignedDriverId: emergency.assignedDriverId,
      assignedAt: emergency.assignedAt?.toISOString() ?? null,
      assignedDriver: emergency.assignedDriver
        ? {
            name: emergency.assignedDriver.name,
            phone: emergency.assignedDriver.phone,
            vehicle: emergency.assignedDriver.driverProfile?.licenseNumber ?? null,
          }
        : null,
      hospitalId: emergency.hospitalId,
      hospitalName: emergency.hospital?.name ?? null,
      hospitalAddress: emergency.hospital?.address ?? null,
      hospitalPhone: emergency.hospital?.phone ?? null,
      timeline: emergency.timeline,
      elapsedSeconds,
      createdAt: emergency.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('[GET /api/sos/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
