import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-drive';

/**
 * GET /api/google-drive/callback
 * Handles the OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Redirect back to knowledge page with error
      return NextResponse.redirect(
        new URL(`/knowledge?gdrive_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/knowledge?gdrive_error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Store tokens in a cookie (httpOnly for security)
    const response = NextResponse.redirect(
      new URL('/knowledge?gdrive_connected=true', request.url)
    );

    // Set tokens in an httpOnly cookie
    response.cookies.set('gdrive_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/knowledge?gdrive_error=${encodeURIComponent(error.message || 'auth_failed')}`, request.url)
    );
  }
}
