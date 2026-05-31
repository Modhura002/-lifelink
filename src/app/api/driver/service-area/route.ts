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
    const { pinCode, city, country } = body;

    if (!pinCode || !city || !country) {
      return NextResponse.json(
        { error: 'pinCode, city, and country are required' },
        { status: 400 }
      );
    }

    // Clean inputs
    const cleanPin = pinCode.toString().trim().toLowerCase();
    const cleanCity = city.toString().trim().toLowerCase();
    const cleanCountry = country.toString().trim().toLowerCase();

    if (cleanPin.length < 4 || cleanPin.length > 10) {
      return NextResponse.json(
        { error: 'Invalid PIN code format' },
        { status: 400 }
      );
    }

    if (cleanCity.length < 2) {
      return NextResponse.json(
        { error: 'City name is too short' },
        { status: 400 }
      );
    }

    // Update user profile with service area
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pinCode: cleanPin,
        city: cleanCity,
        country: cleanCountry,
      },
      select: {
        id: true,
        pinCode: true,
        city: true,
        country: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[PATCH /api/driver/service-area]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
