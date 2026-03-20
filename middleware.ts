import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin emails from environment variable (single source of truth)
const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/auth/callback', '/api/auth/callback'];

// Admin-only routes
const ADMIN_ROUTES = ['/admin', '/metrics'];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
          });
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Use getUser() for secure server-side validation instead of getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Check if it's a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Check if it's an admin route
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    // If user is already logged in and tries to access login, redirect to home
    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin routes
  if (isAdminRoute) {
    const userEmail = user.email?.toLowerCase();
    // Only trust verified emails for admin access
    const isEmailVerified = !!user.email_confirmed_at;
    const isAdmin = isEmailVerified && userEmail && ADMIN_EMAILS.includes(userEmail);

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
