import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const { contactId } = await params;
    await prisma.emergencyContact.delete({ where: { id: contactId } });
    return NextResponse.json({ message: 'Contact deleted' });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    console.error('[DELETE emergency-contact]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
