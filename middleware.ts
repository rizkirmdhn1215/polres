import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that should be protected (require authentication)
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

// Define routes that are always public
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('session');

  // Debug logging
  console.log('Current path:', pathname);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Cookies:', request.cookies.toString());

  // 1. Always allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Always allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Only check authentication for protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      console.log('Redirecting to login - not authenticated for protected route');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Allow all other routes to pass through
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 