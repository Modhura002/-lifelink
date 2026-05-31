import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const driverId = session.user.id;
    const body = await request.json();
    const { emergencyId, matchTier } = body;

    if (!emergencyId) {
      return NextResponse.json({ error: 'emergencyId is required' }, { status: 400 });
    }

    // Atomic transaction: check status then update
    const result = await prisma.$transaction(async (tx) => {
      const emergency = await tx.emergencyRequest.findUnique({
        where: { id: emergencyId },
        select: {
          id: true,
          status: true,
          patientId: true,
          severity: true,
          city: true,
          description: true,
          patientLatitude: true,
          patientLongitude: true,
          assignedDriverId: true,
        },
      });

      if (!emergency) {
        throw new Error('NOT_FOUND');
      }

      if (emergency.status !== 'PENDING') {
        throw new Error('ALREADY_ASSIGNED');
      }

      const now = new Date();

      // Find a hospital to automatically assign
      const hospital = await tx.hospital.findFirst();
      const hospitalId = hospital?.id || null;

      // Atomically claim the emergency and assign hospital
      const updated = await tx.emergencyRequest.update({
        where: { id: emergencyId },
        data: {
          status: 'ACTIVE',
          assignedDriverId: driverId,
          assignedAt: now,
          hospitalId: hospitalId,
          matchTier: matchTier ? parseInt(matchTier) : null,
          timeline: {
            create: [
              {
                event: 'Driver Accepted',
                description: 'Ambulance driver accepted and is on the way',
                timestamp: now.toISOString(),
              },
              ...(hospitalId && hospital ? [{
                event: 'Hospital Notified',
                description: `${hospital.name} has been notified and is preparing.`,
                timestamp: new Date(now.getTime() + 1000).toISOString(),
              }] : []),
            ],
          },
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
              city: true,
              patientProfile: {
                select: {
                  bloodGroup: true,
                  allergies: true,
                  chronicConditions: true,
                  currentMedications: true,
                },
              },
              emergencyContacts: {
                select: { name: true, relationship: true, phone: true },
              },
            },
          },
          timeline: { orderBy: { timestamp: 'asc' } },
        },
      });

      return updated;
    });

    // Mark driver as ON_DUTY
    await prisma.user.update({
      where: { id: driverId },
      data: { driverStatus: 'ON_DUTY' },
    }).catch(() => null);

    // Notify the patient
    await prisma.notification.create({
      data: {
        userId: result.patientId,
        type: 'AMBULANCE',
        title: 'Ambulance Driver Accepted',
        message: 'A driver has accepted your SOS and is heading to you.',
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      emergency: {
        id: result.id,
        status: result.status,
        severity: result.severity,
        city: result.city,
        description: result.description,
        latitude: result.patientLatitude,
        longitude: result.patientLongitude,
        assignedDriverId: result.assignedDriverId,
        assignedAt: result.assignedAt?.toISOString(),
        patient: result.patient,
        timeline: result.timeline,
      },
    });
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg === 'ALREADY_ASSIGNED') {
      return NextResponse.json(
        { error: 'This emergency has already been assigned to another driver.' },
        { status: 409 }
      );
    }
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }
    console.error('[POST /api/driver/accept-emergency]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
