import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin emails - keep in sync with lib/admin-config.ts
const ADMIN_EMAILS = ['bhinrichs1380@gmail.com'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/auth/callback', '/api/auth/callback'];

// Admin-only routes
const ADMIN_ROUTES = ['/admin', '/metrics'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Check if it's a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // Check if it's an admin route
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    // If user is already logged in and tries to access login, redirect to home
    if (pathname === '/login' && session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin routes
  if (isAdminRoute) {
    const userEmail = session.user?.email?.toLowerCase();
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);
    
    if (!isAdmin) {
      // Not an admin, redirect to home with error
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
