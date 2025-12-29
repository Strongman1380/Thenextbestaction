import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(_req: NextRequest) {
  // No authentication required - access controlled via Vercel
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
