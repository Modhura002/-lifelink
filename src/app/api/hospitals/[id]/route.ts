import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: { staff: { select: { id: true } } },
    });
    if (!hospital) return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    const { staff, ...rest } = hospital as typeof hospital & { staff: { id: string }[] };
    return NextResponse.json({
      ...rest,
      specializations: (() => { try { return JSON.parse(rest.specializations || '[]'); } catch { return []; } })(),
      staffCount: staff.length,
    });
  } catch (error) {
    console.error('[GET /api/hospitals/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { availableBeds, icuAvailable, isActive } = body;

    const data: { availableBeds?: number; icuAvailable?: number; isActive?: boolean } = {};
    if (availableBeds !== undefined) data.availableBeds = availableBeds;
    if (icuAvailable !== undefined) data.icuAvailable = icuAvailable;
    if (isActive !== undefined) data.isActive = isActive;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const hospital = await prisma.hospital.update({ where: { id }, data });
    return NextResponse.json({
      ...hospital,
      specializations: (() => { try { return JSON.parse(hospital.specializations || '[]'); } catch { return []; } })(),
    });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    console.error('[PATCH /api/hospitals/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
