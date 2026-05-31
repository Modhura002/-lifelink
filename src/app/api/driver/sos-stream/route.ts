import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POLL_INTERVAL_MS = 4000;

function normalize(s: string | null | undefined) {
  return s?.trim().toLowerCase() ?? '';
}

function doesDriverQualifyForTier(driver: any, emergency: any, tier: number | null) {
  if (!tier) return false;
  
  const sameCountry = normalize(driver.country) === normalize(emergency.country);
  const sameCity = normalize(driver.city) === normalize(emergency.city);
  const samePin = normalize(driver.pinCode) === normalize(emergency.pinCode);

  if (tier === 1) return samePin && sameCity && sameCountry;
  if (tier === 2) return samePin && sameCountry;
  if (tier === 3) return sameCity && sameCountry;
  if (tier === 4) return sameCountry;
  return false;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const driverId = session.user.id;

  // Get driver's location info
  const driver = await prisma.user.findUnique({
    where: { id: driverId },
    select: { pinCode: true, city: true, country: true, role: true, driverStatus: true },
  });

  if (!driver || driver.role !== 'DRIVER') {
    return new Response('Forbidden', { status: 403 });
  }

  const sentEmergencyIds = new Set<string>();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial comment to keep connection alive
      controller.enqueue(encoder.encode(': connected\n\n'));

      let closed = false;

      request.signal.addEventListener('abort', () => {
        closed = true;
        controller.close();
      });

      const sendEvent = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // If any of the required fields are missing, prompt setup
      if (!driver.pinCode || !driver.city || !driver.country) {
        sendEvent({ type: 'SETUP_REQUIRED' });
      } else {
        sendEvent({
          type: 'DRIVER_INFO',
          pinCode: driver.pinCode,
          city: driver.city,
          country: driver.country,
        });
      }

      while (!closed) {
        try {
          // 1. Find ALL PENDING emergencies
          const pendingEmergencies = await prisma.emergencyRequest.findMany({
            where: { status: 'PENDING' },
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  patientProfile: {
                    select: { bloodGroup: true, allergies: true },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          // 4-tier matching algorithm via globally resolved matchTier
          const matchedEmergencies: any[] = [];

          if (driver.driverStatus === 'AVAILABLE') {
            for (const emergency of pendingEmergencies) {
              const qualifies = doesDriverQualifyForTier(driver, emergency, emergency.matchTier);
              if (qualifies) {
                matchedEmergencies.push(emergency);
              }
            }
          }

          const currentIds = new Set(matchedEmergencies.map((m) => m.id));

          // Send newly seen emergencies
          for (const emergency of matchedEmergencies) {
            if (!sentEmergencyIds.has(emergency.id)) {
              sentEmergencyIds.add(emergency.id);
              sendEvent({
                type: 'SOS',
                emergencyId: emergency.id,
                patientId: emergency.patient.id,
                patientName: emergency.patient.name ?? 'Unknown Patient',
                patientPhone: emergency.patient.phone,
                patientBloodGroup: emergency.patient.patientProfile?.bloodGroup ?? null,
                severity: emergency.severity,
                pinCode: emergency.pinCode,
                city: emergency.city,
                country: emergency.country,
                matchTier: emergency.matchTier,
                description: emergency.description,
                location: `${emergency.patientLatitude.toFixed(4)}, ${emergency.patientLongitude.toFixed(4)}`,
                latitude: emergency.patientLatitude,
                longitude: emergency.patientLongitude,
                createdAt: emergency.createdAt.toISOString(),
              });
            }
          }

          // Detect emergencies that are no longer PENDING
          for (const sentId of sentEmergencyIds) {
            if (!currentIds.has(sentId)) {
              // It disappeared from PENDING — check if it's now ACTIVE (assigned)
              const assigned = await prisma.emergencyRequest.findUnique({
                where: { id: sentId },
                select: { status: true, assignedDriverId: true },
              });
              if (assigned && assigned.status !== 'PENDING') {
                const isAssignedToMe = assigned.assignedDriverId === driverId;
                if (!isAssignedToMe) {
                  sendEvent({ type: 'ASSIGNED', emergencyId: sentId });
                }
              }
              sentEmergencyIds.delete(sentId);
            }
          }

          // Send keepalive ping
          if (!closed) {
            try {
              controller.enqueue(encoder.encode(': ping\n\n'));
            } catch {
              closed = true;
              break;
            }
          }
        } catch (err) {
          console.error('[SSE /api/driver/sos-stream] poll error:', err);
        }

        // Wait before next poll
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, POLL_INTERVAL_MS);
          request.signal.addEventListener('abort', () => {
            clearTimeout(t);
            resolve();
          });
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
