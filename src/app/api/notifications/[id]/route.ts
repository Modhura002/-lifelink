import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.isRead === undefined) {
      return NextResponse.json({ error: 'isRead field is required' }, { status: 400 });
    }
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: Boolean(body.isRead) },
    });
    return NextResponse.json(notification);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    console.error('[PATCH /api/notifications/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
