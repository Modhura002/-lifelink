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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const emergencies = await prisma.emergencyRequest.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        timeline: { orderBy: { timestamp: 'asc' } },
        ambulance: true,
        hospital: true,
        patient: true,
      },
    });

    const result = emergencies.map((e) => ({
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
    }));

    return NextResponse.json({ emergencies: result, count: result.length });
  } catch (error) {
    console.error('[GET /api/emergencies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, severity, description, latitude, longitude } = body;

    if (!patientId || severity === undefined || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, severity, latitude, longitude' },
        { status: 400 }
      );
    }

    // Find nearest available ambulance
    const availableAmbulances = await prisma.ambulance.findMany({
      where: { status: 'AVAILABLE' },
    });

    let nearestAmbulance: any = null;
    let minAmbDist = Infinity;

    for (const amb of availableAmbulances) {
      const dist = haversine(latitude, longitude, (amb as any).currentLatitude ?? 0, (amb as any).currentLongitude ?? 0);
      if (dist < minAmbDist) {
        minAmbDist = dist;
        nearestAmbulance = amb;
      }
    }

    // Find nearest hospital with available beds
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true, availableBeds: { gt: 0 } },
    });

    let nearestHospital: any = null;
    let minHospDist = Infinity;

    for (const hosp of hospitals) {
      const dist = haversine(latitude, longitude, (hosp as any).latitude ?? 0, (hosp as any).longitude ?? 0);
      if (dist < minHospDist) {
        minHospDist = dist;
        nearestHospital = hosp;
      }
    }

    // Create emergency request
    const emergency = await prisma.emergencyRequest.create({
      data: {
        patientId,
        severity,
        description: description ?? null,
        patientLatitude: latitude,
        patientLongitude: longitude,
        status: nearestAmbulance ? 'AMBULANCE_ASSIGNED' : 'PENDING',
        ambulanceId: nearestAmbulance?.id ?? null,
        hospitalId: nearestHospital?.id ?? null,
      },
    });

    const now = new Date().toISOString();
    // Create timeline events
    await prisma.emergencyTimeline.create({
      data: {
        emergencyId: emergency.id,
        event: 'SOS Triggered',
        description: 'Emergency request created',
        timestamp: now,
      },
    });

    if (nearestAmbulance) {
      await prisma.emergencyTimeline.create({
        data: {
          emergencyId: emergency.id,
          event: 'Ambulance Assigned',
          description: `Ambulance ${nearestAmbulance.vehicleNumber} assigned (driver: ${nearestAmbulance.driverName})`,
          timestamp: now,
        },
      });

      // Update ambulance status
      await prisma.ambulance.update({
        where: { id: nearestAmbulance.id },
        data: { status: 'EN_ROUTE' },
      });
    }

    // Create notification for the patient
    await prisma.notification.create({
      data: {
        userId: patientId,
        type: 'EMERGENCY',
        title: 'Emergency SOS Activated',
        message: nearestAmbulance
          ? `Ambulance ${nearestAmbulance.vehicleNumber} has been dispatched to your location.`
          : 'Your SOS has been received. Help is on the way.',
        isRead: false,
      },
    });

    const fullEmergency = await prisma.emergencyRequest.findUnique({
      where: { id: emergency.id },
      include: {
        timeline: { orderBy: { timestamp: 'asc' } },
        ambulance: true,
        hospital: true,
        patient: true,
      },
    });

    const result = {
      ...fullEmergency,
      patient: fullEmergency?.patient ? safeUser(fullEmergency.patient) : null,
      hospital: fullEmergency?.hospital
        ? {
            ...fullEmergency.hospital,
            specializations: (() => {
              try { return JSON.parse((fullEmergency.hospital as any).specializations || '[]'); } catch { return []; }
            })(),
          }
        : null,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/emergencies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
