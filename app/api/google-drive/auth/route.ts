import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-drive';

/**
 * GET /api/google-drive/auth
 * Returns the Google OAuth authorization URL
 */
export async function GET() {
  try {
    const authUrl = getAuthUrl();

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
