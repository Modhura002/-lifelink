import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const requestedRole = body.role; // Extract requested role from body

    // Check if user already has a profile based on role
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        driverProfile: true,
        staffProfile: true,
        adminProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role Assignment Logic
    let activeRole = user.role;
    if (activeRole === 'UNASSIGNED') {
      if (!requestedRole) {
        return NextResponse.json({ error: 'Role selection is required' }, { status: 400 });
      }

      // Check Admin Whitelist
      if (requestedRole === 'ADMIN') {
        const adminWhitelist = process.env.ADMIN_EMAIL_WHITELIST?.split(',').map(e => e.trim().toLowerCase()) || [];
        if (!user.email || !adminWhitelist.includes(user.email.toLowerCase())) {
          return NextResponse.json({ error: 'You are not authorized to register as an administrator.' }, { status: 403 });
        }
      }

      // Update User Role
      user = await prisma.user.update({
        where: { id: userId },
        data: { role: requestedRole },
        include: {
          patientProfile: true,
          driverProfile: true,
          staffProfile: true,
          adminProfile: true,
        }
      });
      activeRole = requestedRole;
    } else if (requestedRole && requestedRole !== activeRole) {
       return NextResponse.json({ error: 'Role mismatch. You cannot change your assigned role.' }, { status: 403 });
    }

    // Role-based profile creation
    switch (activeRole) {
      case 'PATIENT':
        if (user.patientProfile) {
          return NextResponse.json({ error: 'Patient profile already exists' }, { status: 400 });
        }
        await prisma.patientProfile.create({
          data: {
            userId,
            age: body.age ? parseInt(body.age) : null,
            gender: body.gender || null,
            dateOfBirth: body.dateOfBirth || null,
            height: body.height ? parseFloat(body.height) : null,
            weight: body.weight ? parseFloat(body.weight) : null,
            bloodGroup: body.bloodGroup || null,
            allergies: JSON.stringify(body.allergies || []),
            existingDiseases: JSON.stringify(body.existingDiseases || []),
            chronicConditions: JSON.stringify(body.chronicConditions || []),
            currentMedications: JSON.stringify(body.currentMedications || []),
            insuranceDetails: body.insuranceDetails || null,
            organDonorStatus: body.organDonorStatus || false,
          }
        });
        if (body.emergencyContacts && Array.isArray(body.emergencyContacts)) {
          await prisma.emergencyContact.createMany({
            data: body.emergencyContacts.map((contact: any) => ({
              userId,
              name: contact.name,
              relationship: contact.relationship,
              phone: contact.phone,
            }))
          });
        }
        break;

      case 'DRIVER':
        if (user.driverProfile) {
          return NextResponse.json({ error: 'Driver profile already exists' }, { status: 400 });
        }
        await prisma.driverProfile.create({
          data: {
            userId,
            licenseNumber: body.licenseNumber,
            licenseExpiry: body.licenseExpiry || null,
            experience: body.experience || null,
            certificationDetails: body.certificationDetails || null,
            status: 'AVAILABLE'
          }
        });
        break;

      case 'HOSPITAL_STAFF':
        if (user.staffProfile) {
          return NextResponse.json({ error: 'Staff profile already exists' }, { status: 400 });
        }
        await prisma.staffProfile.create({
          data: {
            userId,
            department: body.department || null,
            designation: body.designation || null,
            employeeId: body.employeeId || null,
          }
        });
        if (body.hospitalId) {
          await prisma.user.update({
            where: { id: userId },
            data: { hospitalId: body.hospitalId }
          });
        }
        break;

      case 'ADMIN':
        if (user.adminProfile) {
          return NextResponse.json({ error: 'Admin profile already exists' }, { status: 400 });
        }
        await prisma.adminProfile.create({
          data: {
            userId,
            organizationName: body.organizationName || null,
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Profile created successfully' });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
