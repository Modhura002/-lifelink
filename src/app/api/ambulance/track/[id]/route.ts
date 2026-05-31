import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// In-memory waypoint counter — simulates movement per ambulance
const waypointCounters: Record<string, number> = {};

const ROUTE_WAYPOINTS: Record<string, { lat: number; lng: number }[]> = {
  'amb-1': [
    { lat: 28.6139, lng: 77.209 }, { lat: 28.6165, lng: 77.2125 },
    { lat: 28.6202, lng: 77.2158 }, { lat: 28.6245, lng: 77.219 },
    { lat: 28.6283, lng: 77.222 }, { lat: 28.631, lng: 77.2245 },
    { lat: 28.6335, lng: 77.227 }, { lat: 28.635, lng: 77.229 },
  ],
  'amb-6': [
    { lat: 28.628, lng: 77.218 }, { lat: 28.626, lng: 77.216 },
    { lat: 28.624, lng: 77.214 }, { lat: 28.622, lng: 77.2125 },
    { lat: 28.62, lng: 77.2115 }, { lat: 28.618, lng: 77.211 },
    { lat: 28.616, lng: 77.211 }, { lat: 28.614, lng: 77.211 },
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Ambulance ID required' }, { status: 400 });

    const ambulance = await prisma.ambulance.findUnique({ where: { id } });
    if (!ambulance) return NextResponse.json({ error: 'Ambulance not found' }, { status: 404 });

    waypointCounters[id] = ((waypointCounters[id] ?? -1) + 1) % 30;
    const counter = waypointCounters[id];

    const route = ROUTE_WAYPOINTS[id];
    let lat: number, lng: number, bearing: number, speed: number, eta: number, dist: number;

    if (route && route.length > 0) {
      const wi = counter % route.length;
      const ni = (wi + 1) % route.length;
      lat = route[wi].lat + (Math.random() - 0.5) * 0.001;
      lng = route[wi].lng + (Math.random() - 0.5) * 0.001;
      bearing = parseFloat(((Math.atan2(route[ni].lng - route[wi].lng, route[ni].lat - route[wi].lat) * 180 / Math.PI + 360) % 360).toFixed(1));
      speed = 25 + Math.random() * 30;
      eta = Math.max(0, Math.round(480 - (wi / route.length) * 480));
      dist = parseFloat(Math.max(0, (1 - wi / route.length) * 3.5).toFixed(1));
    } else {
      lat = ambulance.currentLatitude + (Math.random() - 0.5) * 0.005;
      lng = ambulance.currentLongitude + (Math.random() - 0.5) * 0.005;
      bearing = parseFloat((Math.random() * 360).toFixed(1));
      speed = 20 + Math.random() * 40;
      eta = 120 + Math.floor(Math.random() * 600);
      dist = parseFloat((Math.random() * 10).toFixed(1));
    }

    return NextResponse.json({
      ambulanceId: id,
      driverName: ambulance.driverName,
      vehicleNumber: ambulance.vehicleNumber,
      driverPhone: ambulance.driverPhone,
      status: ambulance.status,
      location: { latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lng.toFixed(6)) },
      bearing,
      speed: parseFloat(speed.toFixed(1)),
      eta,
      distanceRemaining: dist,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
