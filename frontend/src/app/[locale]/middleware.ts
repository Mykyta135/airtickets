// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/account',
  '/bookings',
  '/tickets',
  '/profile',
  '/checkout',
];

// Define paths that should be inaccessible when authenticated
const guestOnlyPaths = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(prefix => path.startsWith(prefix)) && !token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check if the path is for guests only and user is authenticated
  if (guestOnlyPaths.some(prefix => path.startsWith(prefix)) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};