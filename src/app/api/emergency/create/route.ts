import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, latitude, longitude, severity, description } = body;

    if (!patientId || latitude === undefined || longitude === undefined || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (severity < 1 || severity > 5) {
      return NextResponse.json({ error: 'Severity must be 1-5' }, { status: 400 });
    }

    // Find nearest available ambulance
    const ambulances = await prisma.ambulance.findMany({ where: { status: 'AVAILABLE' } });
    const nearest = ambulances.sort((a, b) =>
      haversine(latitude, longitude, a.currentLatitude, a.currentLongitude) -
      haversine(latitude, longitude, b.currentLatitude, b.currentLongitude)
    )[0] ?? ambulances[0];

    if (!nearest) {
      return NextResponse.json({ error: 'No ambulances available' }, { status: 503 });
    }

    // Find nearest hospital with available beds
    const hospitals = await prisma.hospital.findMany({ where: { isActive: true, availableBeds: { gt: 0 } } });
    const nearestHospital = hospitals.sort((a, b) =>
      haversine(latitude, longitude, a.latitude, a.longitude) -
      haversine(latitude, longitude, b.latitude, b.longitude)
    )[0];

    const now = new Date().toISOString();

    const emergency = await prisma.emergencyRequest.create({
      data: {
        patientId,
        ambulanceId: nearest.id,
        hospitalId: nearestHospital?.id ?? null,
        status: 'AMBULANCE_ASSIGNED',
        severity,
        description: description ?? null,
        patientLatitude: latitude,
        patientLongitude: longitude,
        timeline: {
          create: [
            { event: 'SOS Triggered', description: `Severity Level ${severity}`, timestamp: now },
            { event: 'Ambulance Assigned', description: `${nearest.vehicleNumber} dispatched`, timestamp: now },
          ],
        },
      },
      include: { ambulance: true, hospital: true, timeline: true },
    });

    // Mark ambulance as en route
    await prisma.ambulance.update({ where: { id: nearest.id }, data: { status: 'EN_ROUTE' } });

    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: patientId,
        type: 'AMBULANCE',
        title: 'Ambulance Dispatched',
        message: `${nearest.driverName} is heading to you in ${nearest.vehicleNumber}. ETA ~8 minutes.`,
      },
    });

    return NextResponse.json({
      requestId: emergency.id,
      status: emergency.status,
      severity: emergency.severity,
      description: emergency.description,
      ambulance: {
        id: nearest.id,
        driverName: nearest.driverName,
        vehicleNumber: nearest.vehicleNumber,
        driverPhone: nearest.driverPhone,
        currentLatitude: nearest.currentLatitude,
        currentLongitude: nearest.currentLongitude,
      },
      hospital: nearestHospital ? {
        id: nearestHospital.id,
        name: nearestHospital.name,
        address: nearestHospital.address,
        city: nearestHospital.city,
        phone: nearestHospital.phone,
        availableBeds: nearestHospital.availableBeds,
        icuAvailable: nearestHospital.icuAvailable,
      } : null,
      estimatedETA: 480,
      createdAt: emergency.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Create emergency error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
