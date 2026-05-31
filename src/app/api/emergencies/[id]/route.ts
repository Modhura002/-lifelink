import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function safeUser(u: any) {
  const { passwordHash, ...rest } = u;
  return {
    ...rest,
    allergies: (() => { try { return JSON.parse(rest.allergies || '[]'); } catch { return []; } })(),
    currentMedications: (() => { try { return JSON.parse(rest.currentMedications || '[]'); } catch { return []; } })(),
    chronicConditions: (() => { try { return JSON.parse(rest.chronicConditions || '[]'); } catch { return []; } })(),
  };
}

const ALLOWED_STATUSES = [
  'PENDING',
  'AMBULANCE_ASSIGNED',
  'EN_ROUTE',
  'ARRIVED',
  'ADMITTED',
  'COMPLETED',
  'CANCELLED',
] as const;

type EmergencyStatus = (typeof ALLOWED_STATUSES)[number];

function statusLabel(status: EmergencyStatus): string {
  const labels: Record<EmergencyStatus, string> = {
    PENDING: 'Emergency Pending',
    AMBULANCE_ASSIGNED: 'Ambulance Assigned',
    EN_ROUTE: 'Ambulance En Route',
    ARRIVED: 'Ambulance Arrived',
    ADMITTED: 'Patient Admitted',
    COMPLETED: 'Emergency Completed',
    CANCELLED: 'Emergency Cancelled',
  };
  return labels[status] ?? status;
}

async function getFullEmergency(id: string) {
  const e = await prisma.emergencyRequest.findUnique({
    where: { id },
    include: {
      timeline: { orderBy: { timestamp: 'asc' } },
      ambulance: true,
      hospital: true,
      patient: true,
    },
  });

  if (!e) return null;

  return {
    ...e,
    patient: e.patient ? safeUser(e.patient) : null,
    hospital: e.hospital
      ? {
          ...e.hospital,
          specializations: (() => {
            try { return JSON.parse((e.hospital as any).specializations || '[]'); } catch { return []; }
          })(),
        }
      : null,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const emergency = await getFullEmergency(id);

    if (!emergency) {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }

    return NextResponse.json(emergency);
  } catch (error) {
    console.error('[GET /api/emergencies/[id]]', error);
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
    const { status, event, description } = body;

    if (status && !ALLOWED_STATUSES.includes(status as EmergencyStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (status) {
      await prisma.emergencyRequest.update({ where: { id }, data: { status } });
    }

    const now = new Date().toISOString();
    if (status) {
      await prisma.emergencyTimeline.create({
        data: { emergencyId: id, event: event ?? statusLabel(status as EmergencyStatus), description: description ?? null, timestamp: now },
      });
    } else if (event) {
      await prisma.emergencyTimeline.create({
        data: { emergencyId: id, event, description: description ?? null, timestamp: now },
      });
    }

    const full = await getFullEmergency(id);
    return NextResponse.json(full);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }
    console.error('[PATCH /api/emergencies/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
