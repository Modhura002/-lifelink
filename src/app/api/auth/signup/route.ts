import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_INVITE_CODE = 'LIFELINK-ADMIN-2024';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, adminCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const userRole = (role || 'PATIENT').toUpperCase();

    // Admin code verification
    if (userRole === 'ADMIN' && adminCode !== ADMIN_INVITE_CODE) {
      return NextResponse.json({ error: 'Invalid admin invite code' }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create the clean User record (No mock profiles or medical records generated!)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        phone: body.phone ? body.phone.trim() : null,
        role: userRole,
        isVerified: userRole === 'ADMIN', // Admins are auto-verified
        authProvider: 'CREDENTIALS',
      },
    });

    // We do NOT create any profile here. The user will be redirected to their 
    // respective onboarding flow to create a PatientProfile, DriverProfile, etc.

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
