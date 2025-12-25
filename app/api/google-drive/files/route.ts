import { NextRequest, NextResponse } from 'next/server';
import { listDriveFiles, areTokensExpired, refreshAccessToken, GoogleDriveTokens } from '@/lib/google-drive';

/**
 * GET /api/google-drive/files
 * Lists files from the connected Google Drive
 */
export async function GET(request: NextRequest) {
  try {
    // Get tokens from cookie
    const tokensCookie = request.cookies.get('gdrive_tokens');

    if (!tokensCookie) {
      return NextResponse.json(
        { success: false, error: 'Not connected to Google Drive', needsAuth: true },
        { status: 401 }
      );
    }

    let tokens: GoogleDriveTokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token data', needsAuth: true },
        { status: 401 }
      );
    }

    // Check if tokens are expired and refresh if needed
    if (areTokensExpired(tokens) && tokens.refresh_token) {
      try {
        tokens = await refreshAccessToken(tokens.refresh_token);

        // Update the cookie with new tokens
        const response = NextResponse.json({ success: true, refreshing: true });
        response.cookies.set('gdrive_tokens', JSON.stringify(tokens), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      } catch (refreshError) {
        return NextResponse.json(
          { success: false, error: 'Token expired, please reconnect', needsAuth: true },
          { status: 401 }
        );
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken') || undefined;
    const query = searchParams.get('query') || undefined;
    const folderId = searchParams.get('folderId') || undefined;

    // List files
    const result = await listDriveFiles(tokens, {
      pageSize: 20,
      pageToken,
      query,
      folderId,
    });

    return NextResponse.json({
      success: true,
      files: result.files,
      nextPageToken: result.nextPageToken,
    });
  } catch (error: any) {
    console.error('Error listing Drive files:', error);

    // Check if it's an auth error
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { success: false, error: 'Authentication expired', needsAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
