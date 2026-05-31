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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const where = role ? { role } : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { emergencyContacts: true },
    });

    const result = users.map(safeUser);

    return NextResponse.json({ users: result, count: result.length });
  } catch (error) {
    console.error('[GET /api/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
