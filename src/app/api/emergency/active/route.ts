import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function safeUser(u: any) {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export async function GET() {
  try {
    const emergencies = await prisma.emergencyRequest.findMany({
      where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      include: {
        patient: {
          include: { patientProfile: true }
        },
        ambulance: true,
        hospital: true,
        timeline: { orderBy: { timestamp: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const result = emergencies.map((em) => ({
      ...em,
      patient: em.patient ? safeUser(em.patient) : null,
      hospital: em.hospital ? { ...em.hospital, specializations: JSON.parse(em.hospital.specializations || '[]') } : null,
    }));

    return NextResponse.json({ count: result.length, emergencies: result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Active emergencies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
