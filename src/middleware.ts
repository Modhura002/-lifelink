import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Force UNASSIGNED users to onboarding
    if (token.role === 'UNASSIGNED' && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api/user/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Prevent fully onboarded users from accessing onboarding again
    if (token.role !== 'UNASSIGNED' && pathname.startsWith('/onboarding')) {
      switch (token.role) {
        case 'PATIENT': return NextResponse.redirect(new URL('/?page=dashboard', req.url));
        case 'DRIVER': return NextResponse.redirect(new URL('/?page=driver-dashboard', req.url));
        case 'HOSPITAL_STAFF': return NextResponse.redirect(new URL('/?page=hospital-dashboard', req.url));
        case 'ADMIN': return NextResponse.redirect(new URL('/?page=admin', req.url));
      }
    }

    // Since the app is an SPA on '/', these old checks are mostly dead code,
    // but we'll leave them updated in case a user tries to manually type /dashboard/driver
    if (pathname.startsWith('/dashboard/driver') && token.role !== 'DRIVER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?page=dashboard', req.url));
    }
    
    if (pathname.startsWith('/dashboard/hospital') && token.role !== 'HOSPITAL_STAFF' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?page=dashboard', req.url));
    }

    if (pathname.startsWith('/dashboard/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?page=dashboard', req.url));
    }

    // Protect API routes
    if (pathname.startsWith('/api/admin') && token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/api/users/:path*',
    '/api/admin/:path*',
    '/api/medical-records/:path*',
    '/api/emergency/:path*',
    '/api/hospitals/:path*',
    '/api/ambulances/:path*'
  ],
};
