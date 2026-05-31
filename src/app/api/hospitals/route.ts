import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    const where = city ? { city: { contains: city } } : {};

    const hospitals = await prisma.hospital.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const parsed = hospitals.map((h) => ({
      ...h,
      specializations: (() => {
        try { return JSON.parse((h as any).specializations || '[]'); } catch { return []; }
      })(),
    }));

    return NextResponse.json({ hospitals: parsed, count: parsed.length });
  } catch (error) {
    console.error('[GET /api/hospitals]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
