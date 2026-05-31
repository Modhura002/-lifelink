import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { driverStatus } = body;

    if (!['AVAILABLE', 'OFFLINE'].includes(driverStatus)) {
      return NextResponse.json(
        { error: 'Invalid driverStatus. Must be AVAILABLE or OFFLINE.' },
        { status: 400 }
      );
    }

    // A driver shouldn't go offline if they are currently ON_DUTY
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { driverStatus: true }
    });

    if (user?.driverStatus === 'ON_DUTY') {
      return NextResponse.json(
        { error: 'Cannot change status while ON_DUTY. Complete the emergency first.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { driverStatus },
      select: { id: true, driverStatus: true },
    });

    return NextResponse.json({ success: true, driverStatus: updatedUser.driverStatus });
  } catch (error) {
    console.error('[PATCH /api/driver/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
