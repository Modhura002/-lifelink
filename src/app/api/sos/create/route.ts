import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveMatchTier } from '@/lib/resolve-match-tier';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, severity, description, city, pinCode, country } = body;

    const patientId = session.user.id;

    if (latitude === undefined || longitude === undefined || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (severity < 1 || severity > 5) {
      return NextResponse.json({ error: 'Severity must be 1–5' }, { status: 400 });
    }

    const resolvedCity = (city && typeof city === 'string' && city.trim())
      ? city.trim().toLowerCase()
      : 'unknown';

    const resolvedPin = (pinCode && typeof pinCode === 'string') ? pinCode.trim().toLowerCase() : null;
    const resolvedCountry = (country && typeof country === 'string') ? country.trim().toLowerCase() : null;

    const matchTier = await resolveMatchTier(resolvedPin, resolvedCity, resolvedCountry);

    const now = new Date().toISOString();

    const emergency = await prisma.emergencyRequest.create({
      data: {
        patientId,
        status: 'PENDING',
        severity,
        description: description ?? null,
        city: resolvedCity,
        pinCode: resolvedPin,
        country: resolvedCountry,
        matchTier,
        patientLatitude: latitude,
        patientLongitude: longitude,
        timeline: {
          create: [
            {
              event: 'SOS Triggered',
              description: `Severity ${severity} — Broadcasting to drivers in ${resolvedCity}`,
              timestamp: now,
            },
          ],
        },
      },
      include: { timeline: true },
    });

    // Update patient's city, pin, country in their profile too (for future lookups)
    await prisma.user.update({
      where: { id: patientId },
      data: { city: resolvedCity, pinCode: resolvedPin, country: resolvedCountry },
    }).catch(() => null); // non-blocking

    return NextResponse.json({
      emergencyId: emergency.id,
      status: emergency.status,
      city: emergency.city,
      pinCode: emergency.pinCode,
      country: emergency.country,
      severity: emergency.severity,
      createdAt: emergency.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('[POST /api/sos/create]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
