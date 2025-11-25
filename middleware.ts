import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Refresh session if expired
  await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedRoutes = ['/', '/dashboard', '/clients', '/todos', '/knowledge', '/profile'];
  const authRoutes = ['/login', '/signup'];
  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  );
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If accessing auth route with session, redirect to home
  if (isAuthRoute && session) {
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
