import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contacts = await prisma.emergencyContact.findMany({ where: { userId: id } });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('[GET emergency-contacts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, relationship, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const contact = await prisma.emergencyContact.create({
      data: { userId: id, name, relationship: relationship || 'Other', phone },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('[POST emergency-contacts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
