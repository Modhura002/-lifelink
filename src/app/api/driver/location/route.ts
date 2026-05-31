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
    const { city } = body;

    if (!city || typeof city !== 'string' || !city.trim()) {
      return NextResponse.json({ error: 'city is required' }, { status: 400 });
    }

    const trimmedCity = city.trim();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { city: trimmedCity },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('[PATCH /api/driver/location]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
