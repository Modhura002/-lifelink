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
    const { emergencyId } = body;

    if (!emergencyId) {
      return NextResponse.json({ error: 'emergencyId is required' }, { status: 400 });
    }

    const emergency = await prisma.emergencyRequest.findUnique({
      where: { id: emergencyId },
      select: { id: true, assignedDriverId: true, status: true },
    });

    if (!emergency) {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }

    if (emergency.assignedDriverId !== driverId) {
      return NextResponse.json({ error: 'Forbidden. You are not assigned to this emergency.' }, { status: 403 });
    }

    if (emergency.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Already completed.' });
    }

    const now = new Date();

    // Mark emergency as completed
    const updated = await prisma.emergencyRequest.update({
      where: { id: emergencyId },
      data: {
        status: 'COMPLETED',
        timeline: {
          create: {
            event: 'Emergency Completed',
            description: 'The driver has completed the trip.',
            timestamp: now.toISOString(),
          },
        },
      },
    });

    // Mark driver as free again
    await prisma.user.update({
      where: { id: driverId },
      data: { driverStatus: 'AVAILABLE' },
    }).catch(() => null);

    // Return success
    return NextResponse.json({ success: true, emergency: updated });
  } catch (error) {
    console.error('[POST /api/driver/complete-emergency]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
